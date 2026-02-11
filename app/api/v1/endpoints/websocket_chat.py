from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
from datetime import datetime
import json

router = APIRouter()

# Connection manager to handle multiple WebSocket connections per group
class ConnectionManager:
    def __init__(self):
        # group_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # group_id -> list of recent messages (last 50)
        self.message_history: Dict[str, List[dict]] = {}

    async def connect(self, websocket: WebSocket, group_id: str):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
            self.message_history[group_id] = []
        self.active_connections[group_id].append(websocket)
        
        # Send recent message history to the new connection
        if self.message_history[group_id]:
            await websocket.send_json({
                "type": "history",
                "messages": self.message_history[group_id]
            })

    def disconnect(self, websocket: WebSocket, group_id: str):
        if group_id in self.active_connections:
            self.active_connections[group_id].remove(websocket)
            # Clean up empty group lists
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, message: dict, group_id: str):
        # Store message in history (keep last 50)
        if group_id not in self.message_history:
            self.message_history[group_id] = []
        self.message_history[group_id].append(message)
        if len(self.message_history[group_id]) > 50:
            self.message_history[group_id].pop(0)
        
        # Broadcast to all connected clients in the group
        if group_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[group_id]:
                try:
                    await connection.send_json({
                        "type": "message",
                        "data": message
                    })
                except:
                    # Mark for removal if send fails
                    disconnected.append(connection)
            
            # Remove disconnected clients
            for conn in disconnected:
                if conn in self.active_connections[group_id]:
                    self.active_connections[group_id].remove(conn)

manager = ConnectionManager()

@router.websocket("/ws/groups/{group_id}")
async def websocket_endpoint(websocket: WebSocket, group_id: str):
    await manager.connect(websocket, group_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Create message object with timestamp
            message = {
                "user_id": data.get("user_id"),
                "user_name": data.get("user_name"),
                "message": data.get("message"),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Broadcast to all clients in this group
            await manager.broadcast(message, group_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, group_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, group_id)
