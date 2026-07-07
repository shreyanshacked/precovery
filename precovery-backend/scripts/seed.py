#!/usr/bin/env python3
"""
PRECOVERY — Complete Database Seed Script
─────────────────────────────────────────────────────────────────────────────
Populates Supabase with:
  • 3 doctors (Dr. Priya Nair, Dr. Anil Sharma, Dr. Sofia Martinez)
  • 6 patients assigned correctly per doctor
  • Complete check-in history with AI analysis per day
  • Adherence breakdowns, vitals, appointments, clinical KPIs

Run: python scripts/seed.py
Requires: .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
"""

import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

from passlib.context import CryptContext
from supabase import create_client

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌  ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

TODAY = date.today()

# ─────────────────────────────────────────────────────────────────────────────
# DOCTORS
# ─────────────────────────────────────────────────────────────────────────────
DOCTORS = [
    {
        "name": "Dr. Priya Nair",
        "initials": "PN",
        "email": "priya.nair@precovery.ai",
        "password": "Doctor@123",
        "specialty": "Dermatologist",
        "clinic": "SkinCare Advanced",
        "role": "doctor",
    },
    {
        "name": "Dr. Anil Sharma",
        "initials": "AS",
        "email": "anil.sharma@precovery.ai",
        "password": "Doctor@123",
        "specialty": "Trichologist",
        "clinic": "HairCare Clinic",
        "role": "doctor",
    },
    {
        "name": "Dr. Sofia Martinez",
        "initials": "SM",
        "email": "sofia.martinez@precovery.ai",
        "password": "Doctor@123",
        "specialty": "Aesthetic Surgeon",
        "clinic": "AestheMed Centre",
        "role": "doctor",
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: generate check-ins for a patient
# ─────────────────────────────────────────────────────────────────────────────
def gen_checkins(patient_id, start_date, total_days, current_day, missed_days=None, ai_fn=None):
    missed_days = missed_days or []
    rows = []
    ci_start = start_date - timedelta(days=current_day - 1)
    for i in range(total_days):
        day_num = i + 1
        ci_date = ci_start + timedelta(days=i)
        completed = day_num < current_day and day_num not in missed_days
        missed = day_num in missed_days
        is_today = day_num == current_day
        ai_text = ai_fn(day_num) if ai_fn and (completed or is_today) else None
        rows.append({
            "patient_id": patient_id,
            "day": day_num,
            "date": ci_date.isoformat(),
            "completed": completed,
            "missed": missed,
            "is_today": is_today,
            "ai_analysis_text": ai_text,
            "sent_to_patient": completed and bool(ai_text),
        })
    return rows

# ─────────────────────────────────────────────────────────────────────────────
# PATIENTS DATA
# ─────────────────────────────────────────────────────────────────────────────
PATIENTS = [
    # ── Dr. Priya Nair's patients ─────────────────────────────────────────────
    {
        "_doctor_email": "priya.nair@precovery.ai",
        "name": "Meera Kapoor",
        "initials": "MK",
        "age": 28,
        "gender": "Female",
        "blood_group": "O+",
        "phone": "+91 98112 34567",
        "procedure": "CO2 Laser",
        "condition": "Acne Vulgaris",
        "treatment_protocol": ["CO2 Laser", "Chemical Peel"],
        "phase": "Session 1 of 4",
        "day": 7,
        "total_days": 14,
        "admission_date": (TODAY - timedelta(days=6)).isoformat(),
        "last_visit": "15 May",
        "next_follow_up": (TODAY + timedelta(days=7)).isoformat(),
        "status": "critical",
        "adherence": 42,
        "alert_message": "Grade 3 erythema detected. Grade 2 oedema persisting beyond expected timeline. Confirmed blistering at Day 3 in Fitzpatrick IV skin. HIGH PIH risk. Immediate physician review required.",
        "severity": "GRADE 3",
        "symptoms": "Active comedones, papules, post-inflammatory hyperpigmentation. Melasma-prone Fitzpatrick IV skin. PIH risk elevated.",
        "diagnosis": "Acne Vulgaris — Hormonal type. Grade III severity. Active PIH lesions present.",
        "medications": "Tretinoin 0.025% nightly · Clindamycin gel BD · Sunscreen SPF 50+ AM",
        "precautions": "No sun 72hr. No hair wash 48hr. No swimming 2 weeks. Avoid abrasive scrubs.",
        "tests": "Hormonal panel, CBC. Ferritin, Vit D3, B12.",
        "patient_app": "active",
        "dos": ["Apply moisturiser nightly", "Use SPF 50+ every morning", "Take medications as prescribed", "Drink 2–3L water daily", "Sleep 7–8 hrs"],
        "donts": ["Never skip sunscreen", "No alcohol/smoking", "No chemical treatments", "No heating tools"],
        "_vitals": [
            {"label": "Pulse", "value": "82 bpm", "tone": "good"},
            {"label": "BP", "value": "118/76", "tone": "good"},
            {"label": "SPO2", "value": "98%", "tone": "good"},
            {"label": "Weight", "value": "58 kg", "tone": "neutral"},
        ],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 38, "status": "Critical"},
            {"metric": "Check-ins", "progress": 57, "status": "Low"},
            {"metric": "Photos", "progress": 83, "status": "Good"},
            {"metric": "Precautions", "progress": 28, "status": "Critical"},
        ],
        "_checkin_ai": lambda d: (
            "Day 7 — URGENT: Grade 3 erythema detected. Grade 2 oedema persisting beyond expected timeline. "
            "Confirmed blistering at Day 3 in Fitzpatrick IV skin. HIGH PIH risk. Immediate physician review required. "
            "Consider prednisolone 0.5mg/kg × 3 days. Do NOT proceed with Session 2 until further review."
            if d == 7 else
            f"Day {d} — Recovery progressing. Mild erythema noted. Adherence to post-care protocol satisfactory. Continue current regimen."
        ),
        "_checkin_missed": [4, 5],
        "_today_kpis": [
            {"label": "Erythema", "value": "Gr.3", "severity": "critical"},
            {"label": "PIH Risk", "value": "High", "severity": "critical"},
            {"label": "Oedema", "value": "Gr.2", "severity": "warning"},
            {"label": "Redness", "value": "28%↑", "severity": "warning"},
            {"label": "Dryness", "value": "Mild", "severity": "good"},
            {"label": "Blistering", "value": "Yes", "severity": "critical"},
        ],
        "_today_img_summary": "Visible Grade 3 erythema vs baseline. Oedema persisting T-zone. PIH markers elevated for Fitzpatrick IV. Blistering resolved but crusting present.",
        "_appointments": [
            {"date": (TODAY + timedelta(days=7)).isoformat(), "time": "10:00 AM", "type": "Follow-up", "notes": "Post Session 1 review — critical review required"},
        ],
    },
    {
        "_doctor_email": "priya.nair@precovery.ai",
        "name": "Arjun Patel",
        "initials": "AP",
        "age": 34,
        "gender": "Male",
        "blood_group": "B+",
        "phone": "+91 98112 34568",
        "procedure": "PRP Therapy",
        "condition": "Androgenetic Alopecia (Male)",
        "treatment_protocol": ["PRP Therapy"],
        "phase": "Session 2 of 6",
        "day": 12,
        "total_days": 21,
        "admission_date": (TODAY - timedelta(days=11)).isoformat(),
        "last_visit": "10 May",
        "next_follow_up": (TODAY + timedelta(days=9)).isoformat(),
        "status": "warning",
        "adherence": 68,
        "alert_message": "Norwood Stage III progression detected. Density dropped 12% from baseline. Increased shedding reported last 6 days.",
        "severity": "MODERATE",
        "symptoms": "Diffuse hair thinning at crown and temporal regions. Increased hair fall last 6 months.",
        "diagnosis": "Androgenetic Alopecia — Norwood Stage III Vertex. Miniaturisation confirmed. Density 148 hairs/cm².",
        "medications": "Minoxidil 5% topical daily · Finasteride 1mg oral daily · Biotin 10mg oral daily",
        "precautions": "No sun 72hr. No hair wash 48hr. No swimming 2 weeks.",
        "tests": "DHT, Testosterone. Ferritin, Vit D3, B12.",
        "patient_app": "pending",
        "dos": ["Apply Minoxidil nightly", "Massage scalp 2 min", "Take meds correctly", "Protein-rich diet", "Sleep 7–8hrs · Drink 2–3L"],
        "donts": ["Never skip Finasteride", "No alcohol/smoking", "No chemical treatments", "No heating tools", "No pools 2wks post-PRP"],
        "_vitals": [
            {"label": "Pulse", "value": "76 bpm", "tone": "good"},
            {"label": "BP", "value": "128/82", "tone": "warning"},
            {"label": "SPO2", "value": "98%", "tone": "good"},
            {"label": "Weight", "value": "76 kg", "tone": "neutral"},
        ],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 72, "status": "Low"},
            {"metric": "Check-ins", "progress": 65, "status": "Low"},
            {"metric": "Photos", "progress": 78, "status": "Good"},
            {"metric": "Precautions", "progress": 55, "status": "Low"},
        ],
        "_checkin_ai": lambda d: f"Day {d} — Hair density evaluation: moderate response to PRP. Adherence to minoxidil protocol is suboptimal. Counsel patient to improve consistency.",
        "_checkin_missed": [7],
        "_today_kpis": [
            {"label": "Density", "value": "148/cm²", "severity": "warning"},
            {"label": "Shedding", "value": "Mod.", "severity": "warning"},
            {"label": "Adherence", "value": "68%", "severity": "warning"},
        ],
        "_today_img_summary": "Scalp comparison shows mild density improvement at vertex. Crown miniaturisation pattern ongoing. Response is within expected range for Session 2.",
        "_appointments": [
            {"date": (TODAY + timedelta(days=9)).isoformat(), "time": "11:00 AM", "type": "PRP Session 3", "notes": "Density re-evaluation before session"},
        ],
    },

    # ── Dr. Anil Sharma's patients ────────────────────────────────────────────
    {
        "_doctor_email": "anil.sharma@precovery.ai",
        "name": "Priti Soni",
        "initials": "PS",
        "age": 31,
        "gender": "Female",
        "blood_group": "A+",
        "phone": "+91 99000 11111",
        "procedure": "Microneedling",
        "condition": "Post-Acne Scarring",
        "treatment_protocol": ["Microneedling", "PRP + Microneedling"],
        "phase": "Session 3 of 3",
        "day": 21,
        "total_days": 21,
        "admission_date": (TODAY - timedelta(days=20)).isoformat(),
        "last_visit": "20 May",
        "next_follow_up": (TODAY + timedelta(days=30)).isoformat(),
        "status": "good",
        "adherence": 91,
        "alert_message": "",
        "severity": "ON TRACK",
        "symptoms": "Rolling scars cheek region. Mild textural irregularity.",
        "diagnosis": "Post-acne scarring — Type IV. Boxcar and rolling variants. 70% improvement from baseline.",
        "medications": "Hyaluronic acid serum AM/PM · Vitamin C 10% serum AM · SPF 50+",
        "precautions": "Avoid direct sun for 5 days. No harsh exfoliants.",
        "tests": "None required at this stage.",
        "patient_app": "active",
        "dos": ["Continue serum routine", "SPF every morning", "Stay hydrated", "Eat antioxidant-rich food"],
        "donts": ["No harsh scrubs", "No sun exposure", "No alcohol"],
        "_vitals": [],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 95, "status": "Good"},
            {"metric": "Check-ins", "progress": 88, "status": "Good"},
            {"metric": "Photos", "progress": 92, "status": "Good"},
            {"metric": "Precautions", "progress": 90, "status": "Good"},
        ],
        "_checkin_ai": lambda d: f"Day {d} — Excellent recovery. Scar depth reducing per visual assessment. Patient fully compliant. Treatment outcome exceeding expectations.",
        "_checkin_missed": [],
        "_today_kpis": [
            {"label": "Scar Depth", "value": "-70%", "severity": "good"},
            {"label": "Texture", "value": "Smooth", "severity": "good"},
            {"label": "Erythema", "value": "None", "severity": "good"},
        ],
        "_today_img_summary": "Outstanding result at Day 21. Scar surface 70% improved vs baseline. Collagen remodelling progressing well. No adverse effects noted.",
        "_appointments": [],
    },
    {
        "_doctor_email": "anil.sharma@precovery.ai",
        "name": "Ritika Sharma",
        "initials": "RS",
        "age": 26,
        "gender": "Female",
        "blood_group": "AB+",
        "phone": "+91 88000 22222",
        "procedure": "Chemical Peel",
        "condition": "Melasma",
        "treatment_protocol": ["Chemical Peel", "Laser Toning"],
        "phase": "Session 2 of 5",
        "day": 5,
        "total_days": 10,
        "admission_date": (TODAY - timedelta(days=4)).isoformat(),
        "last_visit": "22 May",
        "next_follow_up": (TODAY + timedelta(days=5)).isoformat(),
        "status": "warning",
        "adherence": 61,
        "alert_message": "Persistent erythema Day 5 post-peel. Patient reports mild burning sensation. Recommend topical cooling and monitor for hypersensitivity.",
        "severity": "MILD CONCERN",
        "symptoms": "Facial hyperpigmentation — malar distribution. Symmetrical melasma pattern.",
        "diagnosis": "Melasma — Epidermal type. Fitzpatrick III. Malar pattern. Responsive to chemical exfoliation.",
        "medications": "Hydroquinone 2% cream nocte · Azelaic acid 15% AM · SPF 50+ mandatory",
        "precautions": "Strict sun avoidance. No heat exposure. No active picking.",
        "tests": "Thyroid panel, hormonal workup.",
        "patient_app": "active",
        "dos": ["SPF reapplication every 2 hrs outdoors", "Wear hat outdoors", "Hydroquinone at night only"],
        "donts": ["Zero sun exposure", "No waxing or threading", "No vitamin C during peel phase"],
        "_vitals": [
            {"label": "Pulse", "value": "72 bpm", "tone": "good"},
            {"label": "BP", "value": "112/70", "tone": "good"},
        ],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 68, "status": "Low"},
            {"metric": "Check-ins", "progress": 60, "status": "Low"},
            {"metric": "Photos", "progress": 75, "status": "Good"},
            {"metric": "Precautions", "progress": 42, "status": "Critical"},
        ],
        "_checkin_ai": lambda d: (
            "Day 5 — Persistent erythema noted. Burning sensation reported by patient. Recommend topical 1% hydrocortisone twice daily. Hold next peel session until Day 10 review."
            if d == 5 else
            f"Day {d} — Post-peel healing progressing. Mild peeling expected. Advise patient to not forcibly remove peeling skin."
        ),
        "_checkin_missed": [3],
        "_today_kpis": [
            {"label": "Erythema", "value": "Mod.", "severity": "warning"},
            {"label": "Peeling", "value": "Active", "severity": "warning"},
            {"label": "Burn Sensation", "value": "Mild", "severity": "warning"},
        ],
        "_today_img_summary": "Day 5 comparison shows active peeling phase. Erythema present but within expected post-peel range. No blistering or infection signs.",
        "_appointments": [
            {"date": (TODAY + timedelta(days=5)).isoformat(), "time": "02:00 PM", "type": "Peel Review", "notes": "Assess healing before Session 3"},
        ],
    },

    # ── Dr. Sofia Martinez's patients ─────────────────────────────────────────
    {
        "_doctor_email": "sofia.martinez@precovery.ai",
        "name": "Vijay Malhotra",
        "initials": "VM",
        "age": 45,
        "gender": "Male",
        "blood_group": "O-",
        "phone": "+91 77000 33333",
        "procedure": "Hair Transplant (FUE)",
        "condition": "Androgenetic Alopecia (Male)",
        "treatment_protocol": ["Hair Transplant (FUE)", "PRP Therapy"],
        "phase": "Post-op Week 2",
        "day": 14,
        "total_days": 28,
        "admission_date": (TODAY - timedelta(days=13)).isoformat(),
        "last_visit": "12 May",
        "next_follow_up": (TODAY + timedelta(days=14)).isoformat(),
        "status": "good",
        "adherence": 84,
        "alert_message": "",
        "severity": "ON TRACK",
        "symptoms": "Post-FUE transplant. Norwood VI pre-op. 3200 grafts placed at crown and hairline.",
        "diagnosis": "Androgenetic Alopecia — Norwood VI. FUE completed. Shock loss phase expected. Graft survival monitoring ongoing.",
        "medications": "Minoxidil 5% topical daily (post Day 14) · Finasteride 1mg oral · Antibiotic cover completed",
        "precautions": "No direct sun on scalp 4 weeks. No gym/sweat 2 weeks. Sleep elevated. No scratching.",
        "tests": "CBC Day 7 (done). DHT, Ferritin 1-month check.",
        "patient_app": "active",
        "dos": ["Sleep with 2 pillows elevated", "Saline spray on recipient area 4x daily", "Protein-rich diet", "Biotin supplement"],
        "donts": ["No gym or heavy exercise", "No alcohol for 2 weeks", "No scratching scalp", "No swimming 4 weeks"],
        "_vitals": [
            {"label": "Pulse", "value": "68 bpm", "tone": "good"},
            {"label": "BP", "value": "122/78", "tone": "good"},
            {"label": "SPO2", "value": "99%", "tone": "good"},
            {"label": "Weight", "value": "84 kg", "tone": "neutral"},
        ],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 88, "status": "Good"},
            {"metric": "Check-ins", "progress": 82, "status": "Good"},
            {"metric": "Photos", "progress": 90, "status": "Good"},
            {"metric": "Precautions", "progress": 77, "status": "Good"},
        ],
        "_checkin_ai": lambda d: (
            "Day 14 — Graft survival looks excellent at 2-week mark. Scabbing resolved. Shock loss phase beginning — counsel patient this is normal. Minoxidil can now begin. Next review at Day 28."
            if d == 14 else
            f"Day {d} — Post-FUE recovery on track. Scabbing at expected stage. Patient compliance with protocols good."
        ),
        "_checkin_missed": [10],
        "_today_kpis": [
            {"label": "Graft Survival", "value": "~95%", "severity": "good"},
            {"label": "Scabbing", "value": "Resolved", "severity": "good"},
            {"label": "Shock Loss", "value": "Onset", "severity": "warning"},
            {"label": "Infection", "value": "None", "severity": "good"},
        ],
        "_today_img_summary": "Day 14 scalp shows scab-free graft sites. Hairline definition maintained. Early shock loss noted at crown — normal for FUE at this stage. No infection.",
        "_appointments": [
            {"date": (TODAY + timedelta(days=14)).isoformat(), "time": "10:00 AM", "type": "Day 28 Review", "notes": "Growth assessment + PRP session scheduling"},
        ],
    },
    {
        "_doctor_email": "sofia.martinez@precovery.ai",
        "name": "Nisha Kumar",
        "initials": "NK",
        "age": 38,
        "gender": "Female",
        "blood_group": "B-",
        "phone": "+91 66000 44444",
        "procedure": "Botox",
        "condition": "Dynamic Wrinkles",
        "treatment_protocol": ["Botox", "Dermal Fillers"],
        "phase": "Session 1 of 2",
        "day": 3,
        "total_days": 7,
        "admission_date": (TODAY - timedelta(days=2)).isoformat(),
        "last_visit": "24 May",
        "next_follow_up": (TODAY + timedelta(days=4)).isoformat(),
        "status": "good",
        "adherence": 95,
        "alert_message": "",
        "severity": "ON TRACK",
        "symptoms": "Glabellar lines Grade III. Forehead lines. Crow's feet bilateral.",
        "diagnosis": "Dynamic wrinkles — Glabellar and periorbital. Glogau Type II. Botox units placed: 24U total.",
        "medications": "Arnica gel topical if bruising · Paracetamol PRN pain",
        "precautions": "No lying down 4 hrs post-injection. No massage on injection sites. No facials 2 weeks.",
        "tests": "None required.",
        "patient_app": "active",
        "dos": ["Stay upright 4 hrs", "Cold compress if swelling", "Facial exercises as advised", "Hydrate well"],
        "donts": ["No rubbing face", "No alcohol 24hrs", "No strenuous exercise 24hrs", "No hot showers first day"],
        "_vitals": [
            {"label": "Pulse", "value": "74 bpm", "tone": "good"},
            {"label": "BP", "value": "110/68", "tone": "good"},
        ],
        "_adherence_breakdown": [
            {"metric": "Medication", "progress": 98, "status": "Good"},
            {"metric": "Check-ins", "progress": 95, "status": "Good"},
            {"metric": "Photos", "progress": 92, "status": "Good"},
            {"metric": "Precautions", "progress": 96, "status": "Good"},
        ],
        "_checkin_ai": lambda d: f"Day {d} — Botox onset progressing normally. Full effect expected at Day 7–14. Patient highly compliant. No adverse effects reported.",
        "_checkin_missed": [],
        "_today_kpis": [
            {"label": "Onset", "value": "Day 3", "severity": "good"},
            {"label": "Bruising", "value": "None", "severity": "good"},
            {"label": "Asymmetry", "value": "None", "severity": "good"},
        ],
        "_today_img_summary": "Day 3 shows clean injection sites, no bruising or haematoma. Glabellar line softening beginning. Full assessment at Day 14 for effect evaluation.",
        "_appointments": [
            {"date": (TODAY + timedelta(days=4)).isoformat(), "time": "03:00 PM", "type": "Day 7 Review", "notes": "Botox effect assessment — top-up if needed"},
        ],
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# SEED FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def clear_tables():
    print("🗑  Clearing existing data…")
    # Order matters due to FK constraints
    for table in ["appointments", "clinical_kpis", "image_analyses", "check_ins",
                  "adherence_breakdown", "patient_vitals", "patient_care",
                  "patients", "doctors"]:
        try:
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception:
            pass  # Table may not exist yet


def seed_doctors():
    print("\n👨‍⚕️  Seeding doctors…")
    doctor_ids = {}
    for d in DOCTORS:
        payload = {
            "name": d["name"],
            "initials": d["initials"],
            "email": d["email"],
            "password_hash": pwd.hash(d["password"]),
            "specialty": d["specialty"],
            "clinic": d["clinic"],
            "role": d["role"],
        }
        res = supabase.table("doctors").insert(payload).execute()
        doc = res.data[0]
        doctor_ids[d["email"]] = doc["id"]
        print(f"   ✓ {d['name']} → {doc['id']}")
    return doctor_ids


def seed_patients(doctor_ids):
    print("\n🏥  Seeding patients…")
    patient_ids = {}

    for p in PATIENTS:
        doc_id = doctor_ids[p["_doctor_email"]]

        # Core patient record
        payload = {
            "doctor_id": doc_id,
            "name": p["name"],
            "initials": p["initials"],
            "age": p["age"],
            "gender": p["gender"],
            "blood_group": p["blood_group"],
            "phone": p["phone"],
            "procedure": p["procedure"],
            "condition": p["condition"],
            "treatment_protocol": p["treatment_protocol"],
            "phase": p["phase"],
            "day": p["day"],
            "total_days": p["total_days"],
            "admission_date": p["admission_date"],
            "last_visit": p["last_visit"],
            "next_follow_up": p["next_follow_up"],
            "status": p["status"],
            "adherence": p["adherence"],
            "alert_message": p["alert_message"],
            "severity": p["severity"],
            "symptoms": p["symptoms"],
            "diagnosis": p["diagnosis"],
            "medications": p["medications"],
            "precautions": p["precautions"],
            "tests": p["tests"],
            "patient_app": p["patient_app"],
            "dos": p["dos"],
            "donts": p["donts"],
        }
        res = supabase.table("patients").insert(payload).execute()
        pat = res.data[0]
        pid = pat["id"]
        patient_ids[p["name"]] = pid
        print(f"   ✓ {p['name']} → {pid}")

        # Vitals
        if p["_vitals"]:
            vitals = [{"patient_id": pid, **v} for v in p["_vitals"]]
            supabase.table("patient_vitals").insert(vitals).execute()

        # Adherence breakdown
        ab = [{"patient_id": pid, **row} for row in p["_adherence_breakdown"]]
        supabase.table("adherence_breakdown").insert(ab).execute()

        # Check-ins
        ci_rows = gen_checkins(
            patient_id=pid,
            start_date=TODAY,
            total_days=p["total_days"],
            current_day=p["day"],
            missed_days=p["_checkin_missed"],
            ai_fn=p["_checkin_ai"],
        )
        for ci in ci_rows:
            ci_res = supabase.table("check_ins").insert(ci).execute()
            ci_id = ci_res.data[0]["id"]
            day_num = ci["day"]

            # Today's KPIs and image analysis
            if ci["is_today"] and p.get("_today_kpis"):
                kpis = [{"check_in_id": ci_id, **k} for k in p["_today_kpis"]]
                supabase.table("clinical_kpis").insert(kpis).execute()

            if ci["is_today"] and p.get("_today_img_summary"):
                supabase.table("image_analyses").insert({
                    "check_in_id": ci_id,
                    "patient_id": pid,
                    "summary": p["_today_img_summary"],
                    "internal_only": True,
                }).execute()

        # Appointments
        if p["_appointments"]:
            appts = [{"patient_id": pid, "doctor_id": doc_id, **a} for a in p["_appointments"]]
            supabase.table("appointments").insert(appts).execute()

    return patient_ids


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("═" * 60)
    print("  PRECOVERY — Database Seed")
    print("═" * 60)

    try:
        clear_tables()
        doctor_ids = seed_doctors()
        patient_ids = seed_patients(doctor_ids)

        print("\n" + "═" * 60)
        print("  ✅  Seed complete!")
        print("═" * 60)
        print("\n📋  Doctor Login Credentials:")
        print("  ┌─────────────────────────────────────────────────────┐")
        for d in DOCTORS:
            print(f"  │  {d['name']:<22} {d['email']:<35}│")
            print(f"  │  {'Password:':<22} {'Doctor@123':<35}│")
            print(f"  │  {'Patients:':<22} {', '.join([p['name'] for p in PATIENTS if p['_doctor_email'] == d['email']]):<35}│")
            print(f"  ├─────────────────────────────────────────────────────┤")
        print("  └─────────────────────────────────────────────────────┘")

    except Exception as e:
        print(f"\n❌  Seed failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
