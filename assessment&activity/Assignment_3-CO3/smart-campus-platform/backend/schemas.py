from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    created_at: str

# --- Facility Schemas ---
class FacilityOut(BaseModel):
    id: int
    name: str
    building: str
    room_number: str
    type: str
    capacity: int
    is_restricted: int
    status: str

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    facility_id: int
    user_id: int
    start_time: str
    end_time: str
    purpose: str
    request_key: Optional[str] = None

    @field_validator("end_time")
    def validate_times(cls, v, info):
        start = info.data.get("start_time")
        if start and v <= start:
            raise ValueError("end_time must be strictly after start_time")
        return v

class BookingOut(BaseModel):
    id: int
    facility_id: int
    facility_name: Optional[str] = None
    user_id: int
    user_name: Optional[str] = None
    start_time: str
    end_time: str
    purpose: str
    status: str
    request_key: Optional[str] = None
    version: int
    created_at: str

# --- Ticket Schemas ---
class TicketCreate(BaseModel):
    facility_id: int
    title: str
    description: str
    category: str = Field(..., pattern="^(HVAC|Electrical|Plumbing|IT_Network|Structural)$")
    urgency: str = Field(..., pattern="^(low|medium|high)$")
    teaching_impact: str = Field(..., pattern="^(low|medium|high)$")
    created_by_user_id: Optional[int] = None

class TicketUpdateState(BaseModel):
    target_status: str = Field(..., pattern="^(intake|assigned|inspection|in_progress|resolved|closed)$")
    expected_version: int
    assigned_technician_id: Optional[int] = None
    inspection_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    performed_by: str

class TicketOut(BaseModel):
    id: int
    ticket_code: str
    facility_id: int
    facility_name: Optional[str] = None
    source_alert_id: Optional[int] = None
    title: str
    description: str
    category: str
    urgency: str
    teaching_impact: str
    priority: str
    priority_justification: str
    status: str
    assigned_technician_id: Optional[int] = None
    assigned_technician_name: Optional[str] = None
    inspection_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    version: int
    created_at: str
    updated_at: str

# --- Sensor Event Schemas ---
class SensorEventCreate(BaseModel):
    source: str
    event_id: str
    metric: str = Field(..., pattern="^(temperature_c|hvac_power_kw|vibration_mm_s)$")
    value: float
    threshold: float
    observed_at: Optional[str] = None

class SensorEventOut(BaseModel):
    id: int
    source: str
    event_id: str
    metric: str
    value: float
    threshold: float
    observed_at: str
    processed: int
    created_ticket_id: Optional[int] = None
    is_duplicate: bool = False

# --- Approval Schemas ---
class ApprovalDecision(BaseModel):
    approver_id: int
    decision: str = Field(..., pattern="^(approved|rejected)$")
    reason: str

class ApprovalOut(BaseModel):
    id: int
    target_type: str
    target_id: int
    approver_id: Optional[int] = None
    approver_name: Optional[str] = None
    decision: str
    reason: Optional[str] = None
    decided_at: Optional[str] = None

# --- Audit & Integration Schemas ---
class AuditEventOut(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    performed_by: str
    details: str
    timestamp: str

class DevOpsIntentOut(BaseModel):
    id: int
    correlation_key: str
    service_name: str
    payload: str
    status: str
    attempts: int
    last_error: Optional[str] = None
    updated_at: str
