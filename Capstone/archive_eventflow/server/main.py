import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from server.database import get_db, init_schema, seed_if_empty

logger = logging.getLogger("eventflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed database on startup
    with get_db() as conn:
        init_schema(conn)
        seed_if_empty(conn)
    yield


app = FastAPI(
    title="EventFlow API",
    description="Campus Event Coordination Platform REST API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers to preserve 1:1 error formatting {"error": message}
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Support dict or string details
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msg = "; ".join([f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in exc.errors()])
    return JSONResponse(
        status_code=400,
        content={"error": f"Invalid request data: {error_msg}"},
    )


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "EventFlow FastAPI REST Server",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Mount Routers
from server.routers.events import router as events_router
from server.routers.registrations import router as registrations_router
from server.routers.attendance import router as attendance_router
from server.routers.announcements import router as announcements_router
from server.routers.stats import router as stats_router

app.include_router(events_router)
app.include_router(registrations_router)
app.include_router(attendance_router)
app.include_router(announcements_router)
app.include_router(stats_router)
