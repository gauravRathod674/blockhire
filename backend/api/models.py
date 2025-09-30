# api/models.py
from django.db import models
from django.core.validators import RegexValidator, EmailValidator

class Employee(models.Model):
    empid = models.CharField(max_length=10, primary_key=True, unique=True, db_collation="utf8mb4_general_ci")
    email = models.EmailField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=64)  # SHA-256 hex
    user_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.empid} - {self.email}"


class PersonalInfo(models.Model):
    empid = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="personal_info")
    firstname = models.CharField(max_length=50, validators=[RegexValidator(r'^[A-Za-z ]+$', "Only letters and spaces allowed")])
    lastname = models.CharField(max_length=50, validators=[RegexValidator(r'^[A-Za-z ]+$', "Only letters and spaces allowed")])
    dob = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.empid_id})"


class ContactInfo(models.Model):
    empid = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="contact_info")
    mobile = models.CharField(max_length=15, validators=[RegexValidator(r'^[0-9+()\-\s]+$', "Invalid mobile number format")])
    email = models.EmailField(max_length=100, validators=[EmailValidator()])
    address = models.TextField()

    def __str__(self):
        return f"Contact for {self.empid_id} - {self.mobile}"


class EmploymentInfo(models.Model):
    empid = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="employment_info")
    job_designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.empid_id} - {self.job_designation}"


class Document(models.Model):
    empid = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="documents")
    document_name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50)
    document_hash = models.CharField(max_length=64)
    content_hash = models.CharField(max_length=64)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    document_data = models.BinaryField()

    def __str__(self):
        return f"{self.document_name} ({self.empid_id})"
