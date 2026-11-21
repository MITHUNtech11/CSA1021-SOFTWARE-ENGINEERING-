import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("gateway.ws")

class WebSocketManager:
    """
    Manages active WebSocket client connections for real-time live telemetry broadcasts.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast_json(self, message: Dict[str, Any]):
        disconnected = []
        # Iterate over a snapshot copy to prevent concurrent modification errors
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to client: {e}")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)
