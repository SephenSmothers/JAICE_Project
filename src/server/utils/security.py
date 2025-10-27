from cryptography.fernet import Fernet
import os

FERNET_KEY = os.environ.get("FERNET_KEY")

try:
    f = Fernet(FERNET_KEY)
except Exception:
    f = None
    print("CRITICAL: Fernet key not loaded. Refresh tokens will not be encrypted.")

def encrypt_token(token: str) -> bytes:
    """Encrypts a string (e.g., Google Refresh Token) to bytes."""
    if not f:
        raise ValueError("Encryption is unavailable: Fernet Key is missing or invalid.")
    return f.encrypt(token.encode('utf-8'))

def decrypt_token(encrypted_token: bytes) -> str:
    """Decrypts bytes back into a string."""
    if not f:
        raise ValueError("Decryption is unavailable: Fernet Key is missing or invalid.")
    
    return f.decrypt(encrypted_token).decode('utf-8')