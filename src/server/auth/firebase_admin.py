import os, json
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

# Load environment variables from the backend .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Path to the Firebase service account credentials
sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Initialize Firebase Admin SDK once
if not firebase_admin._apps:
    if sa_path and os.path.exists(sa_path):
        # Load credentials from the specified file path
        cred = credentials.Certificate(sa_path)
    else:
        # Optionally load credentials from an environment variable
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if not sa_json:
            raise RuntimeError("Service account not configured")
        cred = credentials.Certificate(json.loads(sa_json))
    firebase_admin.initialize_app(cred)
    
# Function to verify Firebase ID tokens    
def verify_id_token(id_token: str):
    return auth.verify_id_token(id_token)