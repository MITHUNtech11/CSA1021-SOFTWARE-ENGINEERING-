from typing import List, Optional
from pydantic import BaseModel, Field


# Session Schemas
class EventSessionCreateSchema(BaseModel):
    round_name: str
    venue_room: str
    start_time: str
    end_time: str
    description: Optional[str] = ""
    order_index: Optional[int] = 0


class EventSessionSchema(EventSessionCreateSchema):
    id: str
    event_id: str


# Event Schemas
class EventCreateSchema(BaseModel):
    organizer_id: Optional[str] = "org-1"
    title: str
    description: str
    category: str
    venue: str
    date: str
    start_time: str
    end_time: str
    registration_deadline: str
    capacity: int
    coordinator_name: Optional[str] = ""
    coordinator_contact: Optional[str] = ""
    banner_url: Optional[str] = ""
    sessions: Optional[List[EventSessionCreateSchema]] = []


class EventUpdateSchema(BaseModel):
    organizer_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    venue: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    registration_deadline: Optional[str] = None
    capacity: Optional[int] = None
    coordinator_name: Optional[str] = None
    coordinator_contact: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None
    sessions: Optional[List[EventSessionCreateSchema]] = None


# Registration Schemas
class RegistrationCreateSchema(BaseModel):
    participant_name: str
    email: str
    phone: str
    college: Optional[str] = "TechTrove University"
    department: str
    year_of_study: str


# Attendance Schemas
class AttendanceUpdateSchema(BaseModel):
    status: str = Field(..., pattern="^(registered|checked_in|absent)$")


class TicketVerifySchema(BaseModel):
    ticket_code: str
    auto_check_in: Optional[bool] = True


# Announcement Schemas
class AnnouncementCreateSchema(BaseModel):
    title: str
    message: str
    priority: Optional[str] = "info"
    event_id: Optional[str] = None
    published_by: Optional[str] = "Admin Coordinator"
