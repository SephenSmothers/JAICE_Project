from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from server.deps.auth import get_current_user

# Create FastAPI application instance
app = FastAPI()

# Allow the frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple health check endpoint
@app.get("/health")
def health():
    return {"ok": True}

# Protected endpoint to get current user info
# Depends(get_current_user) ensures that the user is authenticated
# If valid, 'user' will contain the decoded token information
@app.get("/me")
def me(user=Depends(get_current_user)):
    return {"uid": user["uid"], "email": user.get("email")}