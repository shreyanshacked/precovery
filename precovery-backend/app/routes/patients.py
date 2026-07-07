from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from app.schemas import (
    PatientSummary, PatientDetail, CreatePatientRequest, UpdatePatientRequest,
    ScheduleAppointmentRequest, AppointmentResponse, UpdateAdherenceRequest,
    SendUpdateRequest, SuccessResponse, CheckInResponse, UpdateAIAnalysisRequest,
    VitalSchema, AdherenceBreakdownSchema, ImageAnalysisSchema, ClinicalKpiSchema
)
from app.auth import get_current_doctor, assert_patient_access
from app.database import get_supabase

router = APIRouter(prefix="/patients", tags=["Patients"])


def _format_patient_summary(p: dict) -> PatientSummary:
    return PatientSummary(
        id=p["id"],
        name=p["name"],
        initials=p["initials"],
        age=p["age"],
        gender=p["gender"],
        blood_group=p["blood_group"],
        phone=p["phone"],
        avatar_url=p.get("avatar_url"),
        procedure=p["procedure"],
        condition=p["condition"],
        status=p["status"],
        adherence=p["adherence"],
        phase=p["phase"],
        day=p["day"],
        total_days=p["total_days"],
        last_visit=p.get("last_visit"),
        next_follow_up=str(p["next_follow_up"]) if p.get("next_follow_up") else None,
        alert_message=p.get("alert_message", ""),
        severity=p["severity"],
        patient_app=p.get("patient_app", "pending"),
    )


def _format_check_in(ci: dict, kpis: list, img: dict | None) -> CheckInResponse:
    return CheckInResponse(
        id=ci["id"],
        patient_id=ci["patient_id"],
        day=ci["day"],
        date=str(ci["date"]),
        completed=ci["completed"],
        missed=ci["missed"],
        is_today=ci["is_today"],
        ai_analysis_text=ci.get("ai_analysis_text"),
        sent_to_patient=ci.get("sent_to_patient", False),
        image_analysis=ImageAnalysisSchema(
            baseline_url=img.get("baseline_url"),
            current_url=img.get("current_url"),
            summary=img.get("summary", ""),
            internal_only=img.get("internal_only", True),
        ) if img else None,
        clinical_kpis=[
            ClinicalKpiSchema(label=k["label"], value=k["value"], severity=k["severity"])
            for k in kpis
        ],
    )


# ── GET /patients ─────────────────────────────────────────────────────────────
@router.get("", response_model=List[PatientSummary])
async def list_patients(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    token_data=Depends(get_current_doctor),
):
    """
    Returns all patients assigned to the authenticated doctor.
    Optionally filter by status or search by name/procedure.
    """
    db = get_supabase()
    query = db.table("patients").select("*").eq("doctor_id", token_data.doctor_id)

    if status_filter and status_filter != "all":
        query = query.eq("status", status_filter)

    res = query.order("name").execute()
    patients = res.data

    if search:
        s = search.lower()
        patients = [
            p for p in patients
            if s in p["name"].lower()
            or s in p["procedure"].lower()
            or s in p["condition"].lower()
        ]

    return [_format_patient_summary(p) for p in patients]


# ── GET /patients/{id} ────────────────────────────────────────────────────────
@router.get("/{patient_id}", response_model=PatientDetail)
async def get_patient(patient_id: str, token_data=Depends(get_current_doctor)):
    """Full patient detail including check-ins, vitals, adherence, appointments."""
    from datetime import date as date_type
    db = get_supabase()
    today_str = date_type.today().isoformat()

    # Fetch patient
    res = db.table("patients").select("*").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    p = res.data[0]
    assert_patient_access(token_data.doctor_id, p["doctor_id"])

    # Fetch related data
    vitals_res = db.table("patient_vitals").select("*").eq("patient_id", patient_id).execute()
    ab_res = db.table("adherence_breakdown").select("*").eq("patient_id", patient_id).execute()
    ci_res = db.table("check_ins").select("*").eq("patient_id", patient_id).order("day").execute()
    appt_res = db.table("appointments").select("*").eq("patient_id", patient_id).order("date").execute()

    # Build check-ins with KPIs and images
    # Also dynamically correct is_today based on actual calendar date
    check_ins_out = []
    for ci in ci_res.data:
        kpi_res = db.table("clinical_kpis").select("*").eq("check_in_id", ci["id"]).execute()
        img_res = db.table("image_analyses").select("*").eq("check_in_id", ci["id"]).limit(1).execute()
        img = img_res.data[0] if img_res.data else None

        # Correct is_today: true only if this check-in's date matches today's date
        ci_date = str(ci.get("date", ""))[:10]
        ci["is_today"] = (ci_date == today_str)

        check_ins_out.append(_format_check_in(ci, kpi_res.data, img))

    return PatientDetail(
        id=p["id"],
        name=p["name"],
        initials=p["initials"],
        age=p["age"],
        gender=p["gender"],
        blood_group=p["blood_group"],
        phone=p["phone"],
        avatar_url=p.get("avatar_url"),
        procedure=p["procedure"],
        condition=p["condition"],
        status=p["status"],
        adherence=p["adherence"],
        phase=p["phase"],
        day=p["day"],
        total_days=p["total_days"],
        last_visit=p.get("last_visit"),
        next_follow_up=str(p["next_follow_up"]) if p.get("next_follow_up") else None,
        alert_message=p.get("alert_message", ""),
        severity=p["severity"],
        patient_app=p.get("patient_app", "pending"),
        admission_date=str(p["admission_date"]) if p.get("admission_date") else None,
        symptoms=p.get("symptoms"),
        diagnosis=p.get("diagnosis"),
        medications=p.get("medications"),
        precautions=p.get("precautions"),
        tests=p.get("tests"),
        treatment_protocol=p.get("treatment_protocol", []),
        vitals=[VitalSchema(label=v["label"], value=v["value"], tone=v["tone"]) for v in vitals_res.data],
        adherence_breakdown=[
            AdherenceBreakdownSchema(metric=a["metric"], progress=a["progress"], status=a["status"])
            for a in ab_res.data
        ],
        check_ins=check_ins_out,
        dos=p.get("dos", []),
        donts=p.get("donts", []),
        appointments=[
            AppointmentResponse(
                id=a["id"], patient_id=a["patient_id"],
                date=str(a["date"]), time=a["time"], type=a["type"], notes=a.get("notes"),
                created_at=str(a.get("created_at", "")),
            )
            for a in appt_res.data
        ],
    )


# ── POST /patients ────────────────────────────────────────────────────────────
@router.post("", response_model=PatientSummary, status_code=status.HTTP_201_CREATED)
async def create_patient(body: CreatePatientRequest, token_data=Depends(get_current_doctor)):
    """Register a new patient assigned to the authenticated doctor."""
    db = get_supabase()

    initials = "".join([w[0] for w in body.name.split()[:2]]).upper()

    payload = {
        "doctor_id": token_data.doctor_id,
        "name": body.name,
        "initials": initials,
        "age": body.age,
        "gender": body.gender,
        "blood_group": body.blood_group,
        "phone": body.phone,
        "procedure": body.treatment_protocol[0] if body.treatment_protocol else "Treatment",
        "condition": body.condition,
        "treatment_protocol": body.treatment_protocol,
        "phase": "Session 1",
        "day": 1,
        "total_days": body.total_days,
        "admission_date": body.admission_date,
        "next_follow_up": body.next_follow_up,
        "symptoms": body.symptoms,
        "diagnosis": body.diagnosis,
        "medications": body.medications,
        "precautions": body.precautions,
        "tests": body.tests,
        "status": "good",
        "adherence": 0,
        "severity": "ON TRACK",
        "alert_message": "",
        "patient_app": "pending",
        "dos": body.dos,
        "donts": body.donts,
    }

    res = db.table("patients").insert(payload).execute()
    p = res.data[0]
    pid = p["id"]

    # Insert vitals
    if body.vitals:
        db.table("patient_vitals").insert([{"patient_id": pid, **v.model_dump()} for v in body.vitals]).execute()

    # Default adherence breakdown
    db.table("adherence_breakdown").insert([
        {"patient_id": pid, "metric": "Medication", "progress": 0, "status": "Critical"},
        {"patient_id": pid, "metric": "Check-ins", "progress": 0, "status": "Critical"},
        {"patient_id": pid, "metric": "Photos", "progress": 0, "status": "Critical"},
        {"patient_id": pid, "metric": "Precautions", "progress": 0, "status": "Critical"},
    ]).execute()

    # Create first check-in for today
    from datetime import date
    db.table("check_ins").insert({
        "patient_id": pid,
        "day": 1,
        "date": date.today().isoformat(),
        "completed": False,
        "missed": False,
        "is_today": True,
    }).execute()

    return _format_patient_summary(p)


# ── PUT /patients/{id} ────────────────────────────────────────────────────────
@router.put("/{patient_id}", response_model=PatientDetail)
async def update_patient(patient_id: str, body: UpdatePatientRequest, token_data=Depends(get_current_doctor)):
    """
    Update patient clinical data (diagnosis, medications, precautions, etc.)
    Returns the FULL PatientDetail so the frontend can refresh the entire patient
    record in one shot — no second GET request needed.
    """
    db = get_supabase()

    # Verify ownership
    res = db.table("patients").select("doctor_id").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    assert_patient_access(token_data.doctor_id, res.data[0]["doctor_id"])

    # Build update payload — only include fields that were actually sent
    # Use model_dump(exclude_unset=True) so fields the caller didn't touch are ignored
    update_payload = {
        k: v for k, v in body.model_dump(exclude_unset=True).items()
        if v is not None
    }
    if not update_payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    db.table("patients").update(update_payload).eq("id", patient_id).execute()

    # Re-fetch the FULL patient record including all related tables
    # This is the same logic as GET /patients/{id}
    p_res = db.table("patients").select("*").eq("id", patient_id).execute()
    p = p_res.data[0]

    vitals_res = db.table("patient_vitals").select("*").eq("patient_id", patient_id).execute()
    ab_res = db.table("adherence_breakdown").select("*").eq("patient_id", patient_id).execute()
    ci_res = db.table("check_ins").select("*").eq("patient_id", patient_id).order("day").execute()
    appt_res = db.table("appointments").select("*").eq("patient_id", patient_id).order("date").execute()

    check_ins_out = []
    for ci in ci_res.data:
        kpi_res = db.table("clinical_kpis").select("*").eq("check_in_id", ci["id"]).execute()
        img_res = db.table("image_analyses").select("*").eq("check_in_id", ci["id"]).limit(1).execute()
        img = img_res.data[0] if img_res.data else None
        check_ins_out.append(_format_check_in(ci, kpi_res.data, img))

    return PatientDetail(
        id=p["id"],
        name=p["name"],
        initials=p["initials"],
        age=p["age"],
        gender=p["gender"],
        blood_group=p["blood_group"],
        phone=p["phone"],
        avatar_url=p.get("avatar_url"),
        procedure=p["procedure"],
        condition=p["condition"],
        status=p["status"],
        adherence=p["adherence"],
        phase=p["phase"],
        day=p["day"],
        total_days=p["total_days"],
        last_visit=p.get("last_visit"),
        next_follow_up=str(p["next_follow_up"]) if p.get("next_follow_up") else None,
        alert_message=p.get("alert_message", ""),
        severity=p["severity"],
        patient_app=p.get("patient_app", "pending"),
        admission_date=str(p["admission_date"]) if p.get("admission_date") else None,
        symptoms=p.get("symptoms"),
        diagnosis=p.get("diagnosis"),
        medications=p.get("medications"),
        precautions=p.get("precautions"),
        tests=p.get("tests"),
        treatment_protocol=p.get("treatment_protocol", []),
        vitals=[VitalSchema(label=v["label"], value=v["value"], tone=v["tone"]) for v in vitals_res.data],
        adherence_breakdown=[
            AdherenceBreakdownSchema(metric=a["metric"], progress=a["progress"], status=a["status"])
            for a in ab_res.data
        ],
        check_ins=check_ins_out,
        dos=p.get("dos", []),
        donts=p.get("donts", []),
        appointments=[
            AppointmentResponse(
                id=a["id"], patient_id=a["patient_id"],
                date=str(a["date"]), time=a["time"], type=a["type"], notes=a.get("notes"),
                created_at=str(a.get("created_at", "")),
            )
            for a in appt_res.data
        ],
    )


# ── PUT /patients/{id}/adherence ──────────────────────────────────────────────
@router.put("/{patient_id}/adherence", response_model=SuccessResponse)
async def update_adherence(patient_id: str, body: UpdateAdherenceRequest, token_data=Depends(get_current_doctor)):
    """Update adherence breakdown metrics for a patient."""
    db = get_supabase()
    res = db.table("patients").select("doctor_id").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    assert_patient_access(token_data.doctor_id, res.data[0]["doctor_id"])

    for item in body.breakdown:
        db.table("adherence_breakdown").update({
            "progress": item.progress,
            "status": item.status,
        }).eq("patient_id", patient_id).eq("metric", item.metric).execute()

    # Recalculate overall adherence as average
    overall = int(sum(b.progress for b in body.breakdown) / len(body.breakdown))
    db.table("patients").update({"adherence": overall}).eq("id", patient_id).execute()

    return SuccessResponse(message="Adherence updated")


# ── POST /patients/{id}/appointments ─────────────────────────────────────────
@router.post("/{patient_id}/appointments", response_model=AppointmentResponse, status_code=201)
async def schedule_appointment(patient_id: str, body: ScheduleAppointmentRequest, token_data=Depends(get_current_doctor)):
    """Schedule a new appointment for a patient."""
    db = get_supabase()
    res = db.table("patients").select("doctor_id").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    assert_patient_access(token_data.doctor_id, res.data[0]["doctor_id"])

    appt = db.table("appointments").insert({
        "patient_id": patient_id,
        "doctor_id": token_data.doctor_id,
        "date": body.date,
        "time": body.time,
        "type": body.type,
        "notes": body.notes or "",
    }).execute()

    a = appt.data[0]
    return AppointmentResponse(
        id=a["id"], patient_id=a["patient_id"],
        date=str(a["date"]), time=a["time"],
        type=a["type"], notes=a.get("notes"),
        created_at=str(a.get("created_at", "")),
    )


# ── POST /patients/{id}/send-update ──────────────────────────────────────────
@router.post("/{patient_id}/send-update", response_model=SuccessResponse)
async def send_update_to_patient(patient_id: str, body: SendUpdateRequest, token_data=Depends(get_current_doctor)):
    """
    Triggers sending care plan + AI analysis to the patient's app.
    TODO: Integrate with WhatsApp Business API / push notifications.
    """
    db = get_supabase()
    res = db.table("patients").select("doctor_id, name, phone").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    assert_patient_access(token_data.doctor_id, res.data[0]["doctor_id"])

    patient = res.data[0]

    # Mark today's check-in as sent_to_patient = True
    db.table("check_ins").update({"sent_to_patient": True}).eq(
        "patient_id", patient_id
    ).eq("is_today", True).execute()

    # TODO: call WhatsApp API / push notification service here
    # from app.services.notifications import send_whatsapp_update
    # await send_whatsapp_update(patient["phone"], message=body.message)

    return SuccessResponse(message=f"Updates sent to {patient['name']}")
