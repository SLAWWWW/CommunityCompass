from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from app.models.group import Group, GroupCreate
from app.data import storage

router = APIRouter()

@router.post("/", response_model=Group, status_code=status.HTTP_201_CREATED)
def create_group(
    group_in: GroupCreate,
    x_user_id: str = Header(..., description="User ID of the admin creating the group")
):
    """
    Create a new group. Requires X-User-ID header to simulate auth.
    """
    # Verify user exists
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    group = Group(
        **group_in.dict(),
        admin_id=x_user_id,
        members=[x_user_id] # Admin is automatically a member
    )
    storage.add_item("groups", group.dict())
    return group

@router.get("/", response_model=List[Group])
def read_groups(skip: int = 0, limit: int = 100):
    """
    Retrieve groups.
    """
    groups = storage.get_all("groups")
    return groups[skip : skip + limit]

@router.post("/{group_id}/join", response_model=Group)
def join_group(
    group_id: str,
    x_user_id: str = Header(..., description="User ID of the user joining")
):
    """
    Join a group.
    """
    group_data = storage.get_item_by_id("groups", group_id)
    if not group_data:
        raise HTTPException(status_code=404, detail="Group not found")
    
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if x_user_id in group_data["members"]:
        raise HTTPException(status_code=400, detail="User already in group")
    
    # Check max members
    if len(group_data["members"]) >= group_data["max_members"]:
        raise HTTPException(status_code=400, detail="Group is full")
    
    group_data["members"].append(x_user_id)
    storage.update_item("groups", group_id, {"members": group_data["members"]})
    
    return group_data
