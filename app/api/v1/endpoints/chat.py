from fastapi import APIRouter, HTTPException, Header
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.data import storage

router = APIRouter()

class ChatMessage(BaseModel):
    user_id: str
    user_name: str
    message: str
    timestamp: str = None

    class Config:
        extra = "allow"

class ChatMessageCreate(BaseModel):
    message: str

@router.get("/{group_id}/messages", response_model=List[ChatMessage])
def get_group_messages(group_id: str):
    """
    Get all messages for a group.
    """
    # Get messages for this group from storage
    all_messages = storage.get_all("messages")
    group_messages = [msg for msg in all_messages if msg.get("group_id") == group_id]
    
    # Sort by timestamp
    group_messages.sort(key=lambda x: x.get("timestamp", ""))
    
    return group_messages

@router.post("/{group_id}/messages", response_model=ChatMessage)
def post_group_message(
    group_id: str,
    message_in: ChatMessageCreate,
    x_user_id: str = Header(..., description="User ID of the sender")
):
    """
    Post a new message to a group.
    """
    # Verify group exists
    group = storage.get_item_by_id("groups", group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Verify user exists
    user = storage.get_item_by_id("users", x_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create message
    message = {
        "id": f"msg-{datetime.utcnow().timestamp()}",
        "group_id": group_id,
        "user_id": x_user_id,
        "user_name": user["name"],
        "message": message_in.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    storage.add_item("messages", message)
    
    return ChatMessage(**message)
