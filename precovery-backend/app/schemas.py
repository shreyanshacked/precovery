from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────────────────────

class PatientStatus(str, Enum):
    critical = "critical"
    warning = "warning"
    good = "good"
    resolved = "resolved"


class DoctorRole(str, Enum):
    doctor = "doctor"
    admin = "admin"
    nurse = "nurse"


class ClinicalKpiSeverity(str, Enum):
    critical = "critical"
    warning = "warning"
    good = "good"


# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: "DoctorResponse"


class TokenData(BaseModel):
    doctor_id: str
    role: str


# ─────────────────────────────────────────────────────────────────────────────
# Doctor
# ─────────────────────────────────────────────────────────────────────────────

class DoctorResponse(BaseModel):
    id: str
    name: str
    initials: str
    specialty: str
    clinic: str
    role: str
    email: str
    avatar_url: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Vital
# ─────────────────────────────────────────────────────────────────────────────

class VitalSchema(BaseModel):
    label: str
    value: str
    tone: str = "neutral"  # good | warning | neutral


# ─────────────────────────────────────────────────────────────────────────────
# Adherence Breakdown
# ─────────────────────────────────────────────────────────────────────────────

class AdherenceBreakdownSchema(BaseModel):
    metric: str
    progress: int = Field(ge=0, le=100)
    status: str  # Critical | Low | Good


# ─────────────────────────────────────────────────────────────────────────────
# Clinical KPI
# ─────────────────────────────────────────────────────────────────────────────

class ClinicalKpiSchema(BaseModel):
    label: str
    value: str
    severity: ClinicalKpiSeverity


# ─────────────────────────────────────────────────────────────────────────────
# Image Analysis
# ─────────────────────────────────────────────────────────────────────────────

class ImageAnalysisSchema(BaseModel):
    baseline_url: Optional[str] = None
    current_url: Optional[str] = None
    summary: str
    internal_only: bool = True


# ─────────────────────────────────────────────────────────────────────────────
# Check-in / AI Analysis
# ─────────────────────────────────────────────────────────────────────────────

class CheckInResponse(BaseModel):
    id: str
    patient_id: str
    day: int
    date: str
    completed: bool
    missed: bool
    is_today: bool
    ai_analysis_text: Optional[str] = None
    sent_to_patient: bool = False
    image_analysis: Optional[ImageAnalysisSchema] = None
    clinical_kpis: Optional[List[ClinicalKpiSchema]] = None


class UpdateAIAnalysisRequest(BaseModel):
    text: str
    sent_to_patient: Optional[bool] = None
    clinical_kpis: Optional[List[ClinicalKpiSchema]] = None
    image_analysis: Optional[ImageAnalysisSchema] = None


# ─────────────────────────────────────────────────────────────────────────────
# Appointment
# ─────────────────────────────────────────────────────────────────────────────

class AppointmentSchema(BaseModel):
    date: str
    time: str
    type: str = "Follow-up"
    notes: Optional[str] = None


class AppointmentResponse(AppointmentSchema):
    id: str
    patient_id: str
    created_at: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Patient
# ─────────────────────────────────────────────────────────────────────────────

class PatientSummary(BaseModel):
    """Lightweight patient card for list views"""
    id: str
    name: str
    initials: str
    age: int
    gender: str
    blood_group: str
    phone: str
    avatar_url: Optional[str] = None
    procedure: str
    condition: str
    status: PatientStatus
    adherence: int
    phase: str
    day: int
    total_days: int
    last_visit: Optional[str] = None
    next_follow_up: Optional[str] = None
    alert_message: Optional[str] = None
    severity: str
    patient_app: str = "pending"


class PatientDetail(PatientSummary):
    """Full patient record for detail view"""
    admission_date: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    precautions: Optional[str] = None
    tests: Optional[str] = None
    treatment_protocol: List[str] = []
    vitals: List[VitalSchema] = []
    adherence_breakdown: List[AdherenceBreakdownSchema] = []
    check_ins: List[CheckInResponse] = []
    dos: List[str] = []
    donts: List[str] = []
    appointments: List[AppointmentResponse] = []


class CreatePatientRequest(BaseModel):
    name: str
    phone: str
    age: int
    gender: str
    blood_group: str
    admission_date: str
    condition: str
    treatment_protocol: List[str]
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    precautions: Optional[str] = None
    tests: Optional[str] = None
    next_follow_up: Optional[str] = None
    total_days: int = 14
    vitals: List[VitalSchema] = []
    dos: List[str] = []
    donts: List[str] = []


class UpdatePatientRequest(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    precautions: Optional[str] = None
    tests: Optional[str] = None
    next_follow_up: Optional[str] = None
    status: Optional[PatientStatus] = None
    alert_message: Optional[str] = None
    severity: Optional[str] = None
    dos: Optional[List[str]] = None
    donts: Optional[List[str]] = None


class UpdateAdherenceRequest(BaseModel):
    breakdown: List[AdherenceBreakdownSchema]


class SendUpdateRequest(BaseModel):
    message: Optional[str] = None
    include_care_plan: bool = True
    include_ai_analysis: bool = True


class ScheduleAppointmentRequest(BaseModel):
    date: str
    time: str
    type: str = "Follow-up"
    notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Generic
# ─────────────────────────────────────────────────────────────────────────────

class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    detail: str
