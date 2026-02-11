from fastapi import APIRouter
from app.api.v1.endpoints import users, groups, chat

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(chat.router, prefix="/groups", tags=["chat"])
