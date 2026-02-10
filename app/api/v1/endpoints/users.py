from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.models.user import User, UserCreate
from app.data import storage

router = APIRouter()

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate):
    """
    Create a new user.
    """
    # Check if email already exists (simple linear search for now)
    users = storage.get_all("users")
    for user in users:
        if user["email"] == user_in.email:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
    
    user = User(**user_in.dict())
    storage.add_item("users", user.dict())
    return user

@router.get("/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 100):
    """
    Retrieve users.
    """
    users = storage.get_all("users")
    return users[skip : skip + limit]

@router.get("/{user_id}", response_model=User)
def read_user_by_id(user_id: str):
    """
    Get a specific user by id.
    """
    user = storage.get_item_by_id("users", user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User '{user_id}' not found",
        )
    return user
