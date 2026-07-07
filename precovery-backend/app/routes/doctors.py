from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.schemas import DoctorResponse, SuccessResponse
from app.auth import get_current_doctor, hash_password, require_admin
from app.database import get_supabase

router = APIRouter(prefix="/doctors", tags=["Doctors"])


class CreateDoctorRequest(BaseModel):
    name: str
    email: str
    password: str
    specialty: str = "General"
    clinic: str = "PRECOVERY Clinic"
    role: str = "doctor"


class AssignPatientRequest(BaseModel):
    patient_id: str
    doctor_id: str


# ── GET /doctors ──────────────────────────────────────────────────────────────
@router.get("", response_model=List[DoctorResponse])
async def list_doctors(token_data=Depends(get_current_doctor)):
    """
    Returns all doctors in the system.
    Any authenticated doctor can see the list (needed for patient reassignment UI).
    Passwords are never returned.
    """
    db = get_supabase()
    res = db.table("doctors").select(
        "id, name, initials, email, specialty, clinic, role, avatar_url, created_at"
    ).order("name").execute()

    return [
        DoctorResponse(
            id=d["id"], name=d["name"], initials=d["initials"],
            email=d["email"], specialty=d["specialty"],
            clinic=d["clinic"], role=d["role"],
            avatar_url=d.get("avatar_url"),
        )
        for d in res.data
    ]


# ── POST /doctors ─────────────────────────────────────────────────────────────
@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(body: CreateDoctorRequest, token_data=Depends(get_current_doctor)):
    """
    Create a new doctor account.
    Any authenticated doctor can create another doctor for now.
    Restrict to admin-only by changing Depends to require_admin.
    """
    db = get_supabase()

    # Check email not already in use
    existing = db.table("doctors").select("id").eq("email", body.email.lower().strip()).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A doctor with email {body.email} already exists",
        )

    initials = "".join([w[0] for w in body.name.split()[:2]]).upper()

    res = db.table("doctors").insert({
        "name": body.name,
        "initials": initials,
        "email": body.email.lower().strip(),
        "password_hash": hash_password(body.password),
        "specialty": body.specialty,
        "clinic": body.clinic,
        "role": body.role,
    }).execute()

    d = res.data[0]
    return DoctorResponse(
        id=d["id"], name=d["name"], initials=d["initials"],
        email=d["email"], specialty=d["specialty"],
        clinic=d["clinic"], role=d["role"],
        avatar_url=d.get("avatar_url"),
    )


# ── POST /doctors/assign-patient ──────────────────────────────────────────────
@router.post("/assign-patient", response_model=SuccessResponse)
async def assign_patient(body: AssignPatientRequest, token_data=Depends(get_current_doctor)):
    """
    Reassign a patient from one doctor to another.
    Updates the patient's doctor_id in Supabase.
    """
    db = get_supabase()

    # Verify patient exists
    pat = db.table("patients").select("id, name, doctor_id").eq("id", body.patient_id).execute()
    if not pat.data:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Verify target doctor exists
    doc = db.table("doctors").select("id, name").eq("id", body.doctor_id).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Update the assignment
    db.table("patients").update({
        "doctor_id": body.doctor_id
    }).eq("id", body.patient_id).execute()

    # Also update appointments to point to new doctor
    db.table("appointments").update({
        "doctor_id": body.doctor_id
    }).eq("patient_id", body.patient_id).execute()

    return SuccessResponse(
        message=f"{pat.data[0]['name']} reassigned to {doc.data[0]['name']}"
    )
