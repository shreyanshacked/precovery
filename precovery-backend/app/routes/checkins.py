from datetime import date as date_type
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import CheckInResponse, UpdateAIAnalysisRequest, ImageAnalysisSchema, ClinicalKpiSchema
from app.auth import get_current_doctor, assert_patient_access
from app.database import get_supabase

router = APIRouter(prefix="/patients", tags=["Check-ins & AI Analysis"])


def _get_patient_or_403(db, patient_id: str, doctor_id: str):
    res = db.table("patients").select("doctor_id").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    assert_patient_access(doctor_id, res.data[0]["doctor_id"])


def _format_check_in(ci, kpis, img) -> CheckInResponse:
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
        image_analysis=ImageAnalysisSchema(**{
            "baseline_url": img.get("baseline_url"),
            "current_url": img.get("current_url"),
            "summary": img.get("summary", ""),
            "internal_only": img.get("internal_only", True),
        }) if img else None,
        clinical_kpis=[
            ClinicalKpiSchema(label=k["label"], value=k["value"], severity=k["severity"])
            for k in kpis
        ],
    )


# ── GET /patients/{id}/checkins ───────────────────────────────────────────────
@router.get("/{patient_id}/checkins", response_model=list[CheckInResponse])
async def list_check_ins(patient_id: str, token_data=Depends(get_current_doctor)):
    """Returns all check-ins with AI analysis, KPIs, and image analysis.
    is_today is calculated dynamically from the real calendar date."""
    db = get_supabase()
    _get_patient_or_403(db, patient_id, token_data.doctor_id)
    today_str = date_type.today().isoformat()

    ci_res = db.table("check_ins").select("*").eq("patient_id", patient_id).order("day").execute()
    result = []
    for ci in ci_res.data:
        kpi_res = db.table("clinical_kpis").select("*").eq("check_in_id", ci["id"]).execute()
        img_res = db.table("image_analyses").select("*").eq("check_in_id", ci["id"]).limit(1).execute()
        img = img_res.data[0] if img_res.data else None
        # Correct is_today dynamically
        ci["is_today"] = (str(ci.get("date", ""))[:10] == today_str)
        result.append(_format_check_in(ci, kpi_res.data, img))

    return result


# ── GET /patients/{id}/checkins/{day} ─────────────────────────────────────────
@router.get("/{patient_id}/checkins/{day}", response_model=CheckInResponse)
async def get_check_in(patient_id: str, day: int, token_data=Depends(get_current_doctor)):
    """Returns a specific day's check-in record with full AI analysis."""
    db = get_supabase()
    _get_patient_or_403(db, patient_id, token_data.doctor_id)
    today_str = date_type.today().isoformat()

    ci_res = db.table("check_ins").select("*").eq("patient_id", patient_id).eq("day", day).execute()
    if not ci_res.data:
        raise HTTPException(status_code=404, detail=f"Check-in for day {day} not found")

    ci = ci_res.data[0]
    ci["is_today"] = (str(ci.get("date", ""))[:10] == today_str)

    kpi_res = db.table("clinical_kpis").select("*").eq("check_in_id", ci["id"]).execute()
    img_res = db.table("image_analyses").select("*").eq("check_in_id", ci["id"]).limit(1).execute()
    img = img_res.data[0] if img_res.data else None

    return _format_check_in(ci, kpi_res.data, img)


# ── PUT /patients/{id}/ai-analysis ────────────────────────────────────────────
@router.put("/{patient_id}/ai-analysis", response_model=CheckInResponse)
async def update_ai_analysis(
    patient_id: str,
    body: UpdateAIAnalysisRequest,
    token_data=Depends(get_current_doctor),
):
    """
    Doctor updates today's AI analysis text, clinical KPIs, and image analysis.
    Finds today's check-in by matching the actual calendar date — not the static
    is_today flag — so it always works regardless of when the DB was seeded.
    """
    db = get_supabase()
    _get_patient_or_403(db, patient_id, token_data.doctor_id)
    today_str = date_type.today().isoformat()

    # Find today's check-in by real calendar date (not the static is_today flag)
    ci_res = db.table("check_ins").select("*").eq("patient_id", patient_id).execute()
    today_ci = None
    for row in ci_res.data:
        if str(row.get("date", ""))[:10] == today_str:
            today_ci = row
            break

    # Fallback: if no check-in matches today's date, use the one flagged is_today
    if not today_ci:
        for row in ci_res.data:
            if row.get("is_today"):
                today_ci = row
                break

    if not today_ci:
        raise HTTPException(
            status_code=404,
            detail="No check-in found for today. Ensure a check-in row exists for today's date."
        )

    ci_id = today_ci["id"]

    # Update AI analysis text
    update = {"ai_analysis_text": body.text}
    if body.sent_to_patient is not None:
        update["sent_to_patient"] = body.sent_to_patient

    updated_ci = db.table("check_ins").update(update).eq("id", ci_id).execute()

    # Update clinical KPIs (delete old, insert new)
    if body.clinical_kpis is not None:
        db.table("clinical_kpis").delete().eq("check_in_id", ci_id).execute()
        if body.clinical_kpis:
            kpis = [
                {"check_in_id": ci_id, "label": k.label, "value": k.value, "severity": k.severity}
                for k in body.clinical_kpis
            ]
            db.table("clinical_kpis").insert(kpis).execute()

    # Update image analysis (upsert)
    if body.image_analysis is not None:
        existing = db.table("image_analyses").select("id").eq("check_in_id", ci_id).execute()
        img_payload = {
            "check_in_id": ci_id,
            "patient_id": patient_id,
            "summary": body.image_analysis.summary,
            "baseline_url": body.image_analysis.baseline_url,
            "current_url": body.image_analysis.current_url,
            "internal_only": body.image_analysis.internal_only,
        }
        if existing.data:
            db.table("image_analyses").update(img_payload).eq("id", existing.data[0]["id"]).execute()
        else:
            db.table("image_analyses").insert(img_payload).execute()

    # Fetch fresh data to return
    ci_out = updated_ci.data[0]
    ci_out["is_today"] = True  # we just updated today's check-in
    kpi_res = db.table("clinical_kpis").select("*").eq("check_in_id", ci_id).execute()
    img_res = db.table("image_analyses").select("*").eq("check_in_id", ci_id).limit(1).execute()
    img = img_res.data[0] if img_res.data else None

    return _format_check_in(ci_out, kpi_res.data, img)
