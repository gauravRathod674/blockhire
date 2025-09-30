from ninja import Router,NinjaAPI, Schema, File
from ninja.files import UploadedFile
from ninja.errors import HttpError
from django.http import HttpRequest
from .models import Employee, PersonalInfo, ContactInfo, EmploymentInfo, Document
from .auth_utils import create_jwt, decode_jwt, sha256_hex, generate_empid
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import hashlib, time
from django.conf import settings

# [+] Main NinjaAPI instance that handles the application
api = NinjaAPI()

# You can still use routers to organize endpoints, but they must be registered with the main 'api' instance.
# We will define endpoints directly on 'api' for simplicity here.

@api.get("/")
def hello(request):
    return {"message": "Hello from Django Ninja!"}

class RegisterIn(Schema):
    email: str
    password: str


class LoginIn(Schema):
    email: str
    password: str


class ProfileIn(Schema):
    firstName: str | None = None
    lastName: str | None = None
    dateOfBirth: str | None = None  # YYYY-MM-DD
    mobile: str | None = None
    email: str | None = None
    address: str | None = None
    jobDesignation: str | None = None
    department: str | None = None
    employeeId: str | None = None


def token_from_request(request: HttpRequest):
    token = request.COOKIES.get("access_token")
    if token:
        return token
    auth = request.headers.get("Authorization") or request.META.get(
        "HTTP_AUTHORIZATION", ""
    )
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1]
    return None


def get_profile_for(emp: Employee):
    p = emp.personal_info.first()
    c = emp.contact_info.first()
    e = emp.employment_info.first()
    doc = emp.documents.order_by("-uploaded_at").first()
    document_hash = doc.document_hash if doc else None

    return {
        "firstName": p.firstname if p else "",
        "lastName": p.lastname if p else "",
        "dateOfBirth": p.dob.isoformat() if p else "",
        "mobile": c.mobile if c else "",
        "email": emp.email,
        "address": c.address if c else "",
        "jobDesignation": e.job_designation if e else "",
        "department": e.department if e else "",
        "employeeId": emp.empid,
        "userHash": emp.user_hash,
        "documentHash": document_hash,
    }


@api.post("/auth/register/")
def register(request, payload: RegisterIn):
    email = payload.email.strip().lower()
    password = payload.password

    try:
        validate_email(email)
    except ValidationError:
        return {"ok": False, "error": "Invalid email"}

    if len(password) < 8:
        return {"ok": False, "error": "Password must be at least 8 characters"}

    if Employee.objects.filter(email=email).exists():
        return {"ok": False, "error": "Email already registered"}

    password_hash = sha256_hex(password)
    empid = generate_empid()
    while Employee.objects.filter(empid=empid).exists():
        empid = generate_empid()
    user_hash = sha256_hex(email + str(time.time()))
    emp = Employee.objects.create(
        empid=empid, email=email, password_hash=password_hash, user_hash=user_hash
    )

    return {"ok": True, "message": "Registration successful. Please login."}


@api.post("/auth/login/")
def login(request, payload: LoginIn):
    email = payload.email.strip().lower()
    password = payload.password
    try:
        emp = Employee.objects.get(email=email)
    except Employee.DoesNotExist:
        raise HttpError(401, "Invalid credentials")


    if emp.password_hash != sha256_hex(password):
        raise HttpError(401, "Invalid credentials")


    token = create_jwt(emp.empid)
    res = {"ok": True, "profile": get_profile_for(emp)}
    
    # [+] CORRECTED: Use the main 'api' instance to create the response
    response = api.create_response(request, res, status=200)
    
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        samesite="Lax", # Use 'Lax' for development if not using HTTPS
        secure=not settings.DEBUG,
        path="/"
    )
    return response


@api.post("/auth/logout/")
def logout(request):
    # [+] CORRECTED: Use the main 'api' instance to create the response
    response = api.create_response(request, {"ok": True}, status=200)
    response.delete_cookie("access_token", path="/")
    return response


@api.get("/me/")
def me(request):
    token = token_from_request(request)
    if not token:
        raise HttpError(401, "Not authenticated")
    payload = decode_jwt(token)
    if not payload:
        raise HttpError(401, "Invalid token")
    empid = payload.get("empid")
    try:
        emp = Employee.objects.get(empid=empid)
    except Employee.DoesNotExist:
        raise HttpError(404, "User not found")
    return {"ok": True, "profile": get_profile_for(emp)}


@api.get("/profile/")
def profile_get(request):
    token = token_from_request(request)
    if not token:
        raise HttpError(401, "Not authenticated")
    payload = decode_jwt(token)
    if not payload:
        raise HttpError(401, "Invalid token")
    empid = payload.get("empid")
    try:
        emp = Employee.objects.get(empid=empid)
    except Employee.DoesNotExist:
        raise HttpError(404, "User not found")
    return {"ok": True, "profile": get_profile_for(emp)}


@api.put("/profile/")
def profile_update(request, payload: ProfileIn):
    token = token_from_request(request)
    if not token:
        raise HttpError(401, "Not authenticated")
    payload_jwt = decode_jwt(token)
    if not payload_jwt:
        raise HttpError(401, "Invalid token")
    empid = payload_jwt.get("empid")
    emp = Employee.objects.get(empid=empid)

    if payload.email:
        email = payload.email.strip().lower()
        try:
            validate_email(email)
        except ValidationError:
            return {"ok": False, "error": "Invalid email format"}
        if email != emp.email and Employee.objects.filter(email=email).exists():
            return {"ok": False, "error": "Email already in use"}
        emp.email = email
        emp.save()

    if payload.firstName or payload.lastName or payload.dateOfBirth:
        p, _ = PersonalInfo.objects.get_or_create(empid=emp)
        p.firstname = payload.firstName or p.firstname
        p.lastname = payload.lastName or p.lastname
        p.dob = payload.dateOfBirth or p.dob
        p.save()

    if payload.mobile or payload.address or payload.email:
        c, _ = ContactInfo.objects.get_or_create(empid=emp, defaults={'email': emp.email})
        c.mobile = payload.mobile or c.mobile
        c.address = payload.address or c.address
        c.email = emp.email
        c.save()

    if payload.jobDesignation or payload.department:
        e, _ = EmploymentInfo.objects.get_or_create(empid=emp)
        e.job_designation = payload.jobDesignation or e.job_designation
        e.department = payload.department or e.department
        e.save()

    return {"ok": True, "profile": get_profile_for(emp)}

@api.post("/documents/")
def upload_document(request, file: UploadedFile = File(...)):
    token = token_from_request(request)
    if not token:
        raise HttpError(401, "Not authenticated")
    payload_jwt = decode_jwt(token)
    if not payload_jwt:
        raise HttpError(401, "Invalid token")
    empid = payload_jwt.get("empid")
    emp = Employee.objects.get(empid=empid)

    # --- CRITICAL FIX: Use the 'file' parameter injected by Ninja ---
    if not file:
        return {"ok": False, "error": "No file uploaded"}

    data = file.read()
    content_hash = hashlib.sha256(data).hexdigest()
    document_name = file.name
    document_type = file.content_type or "application/octet-stream"

    doc = Document.objects.create(
        empid=emp,
        document_name=document_name,
        document_type=document_type,
        document_hash=content_hash,
        content_hash=content_hash,
        document_data=data,
    )

    return {"ok": True, "documentHash": doc.document_hash}
