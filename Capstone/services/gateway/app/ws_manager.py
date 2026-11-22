import asyncio
import logging
from collections.abc import Callable

from fastapi import WebSocket

logger = logging.getLogger("gateway.ws")


class WebSocketManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self._broadcast_lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, snapshot: Callable[[], dict]):
        await websocket.accept()
        async with self._broadcast_lock:
            await asyncio.wait_for(websocket.send_json(snapshot()), timeout=2)
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        async with self._broadcast_lock:
            await asyncio.gather(*(
                self._send(connection, message) for connection in self.active_connections
            ))

    async def _send(self, connection: WebSocket, message: dict):
        try:
            await asyncio.wait_for(connection.send_json(message), timeout=2)
        except Exception as exc:
            logger.warning("WebSocket broadcast failed: %s", exc)
            self.disconnect(connection)
            try:
                await asyncio.wait_for(connection.close(code=1011), timeout=1)
            except Exception:
                pass
