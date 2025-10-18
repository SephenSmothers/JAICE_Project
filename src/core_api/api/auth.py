from fastapi import APIRouter, Depends
from src.core_api.deps.auth import get_current_user

# Create a new router object
router = APIRouter()

# Protected endpoint to get current user info
# The path here is relative to the prefix in main.py
@router.get("/me")
def me(user=Depends(get_current_user)):
  # Get the current authenticated user's information
  return {"uid": user["uid"], "email": user.get("email")}

