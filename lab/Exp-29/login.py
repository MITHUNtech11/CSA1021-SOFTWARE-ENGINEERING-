import hashlib
import secrets

USERS_DB = {
    'mithun@simats.edu': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'  # 'password'
}

def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode('utf-8')).hexdigest()

def authenticate_user(email: str, pwd: str) -> dict:
    hashed = hash_password(pwd)
    if email in USERS_DB and USERS_DB[email] == hashed:
        token = secrets.token_hex(16)
        return {'success': True, 'token': token, 'email': email}
    return {'success': False, 'error': 'Invalid credentials'}
