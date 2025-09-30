# api/auth_utils.py
import jwt
import datetime
import time
import random
import hashlib
from django.conf import settings

ALGO = "HS256"
SECRET = settings.SECRET_KEY
EXP_SECONDS = getattr(settings, "JWT_EXPIRATION_SECONDS", 24*3600)

def create_jwt(empid: str) -> str:
    payload = {
        "empid": empid,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=EXP_SECONDS),
    }
    token = jwt.encode(payload, SECRET, algorithm=ALGO)
    return token

def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        return payload
    except Exception:
        return None

def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()

def generate_empid():
    for _ in range(10):
        cand = f"emp{random.randint(10000, 9999999)}"[:10]
        # caller should check uniqueness
        return cand
