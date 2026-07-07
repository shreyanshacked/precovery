-- ═══════════════════════════════════════════════════════════════════════════
-- PRECOVERY — Complete Supabase Database Schema
-- Run this ENTIRE script in the Supabase SQL Editor (once, in order)
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Drop existing tables (clean slate for re-runs) ────────────────────────
DROP TABLE IF EXISTS appointments         CASCADE;
DROP TABLE IF EXISTS clinical_kpis        CASCADE;
DROP TABLE IF EXISTS image_analyses       CASCADE;
DROP TABLE IF EXISTS check_ins            CASCADE;
DROP TABLE IF EXISTS adherence_breakdown  CASCADE;
DROP TABLE IF EXISTS patient_vitals       CASCADE;
DROP TABLE IF EXISTS patient_care         CASCADE;
DROP TABLE IF EXISTS patients             CASCADE;
DROP TABLE IF EXISTS doctors              CASCADE;

-- ── 2. doctors ───────────────────────────────────────────────────────────────
CREATE TABLE doctors (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    initials      TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    specialty     TEXT NOT NULL DEFAULT 'General',
    clinic        TEXT NOT NULL DEFAULT 'PRECOVERY Clinic',
    role          TEXT NOT NULL DEFAULT 'doctor' CHECK (role IN ('doctor','admin','nurse')),
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. patients ──────────────────────────────────────────────────────────────
CREATE TABLE patients (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

    -- Identity
    name             TEXT NOT NULL,
    initials         TEXT NOT NULL,
    age              INTEGER NOT NULL DEFAULT 0,
    gender           TEXT NOT NULL DEFAULT 'Unknown',
    blood_group      TEXT NOT NULL DEFAULT 'Unknown',
    phone            TEXT NOT NULL,
    avatar_url       TEXT,

    -- Treatment
    procedure        TEXT NOT NULL,
    condition        TEXT NOT NULL,
    treatment_protocol TEXT[] NOT NULL DEFAULT '{}',
    phase            TEXT NOT NULL DEFAULT 'Session 1',
    day              INTEGER NOT NULL DEFAULT 1,
    total_days       INTEGER NOT NULL DEFAULT 14,
    admission_date   DATE,
    last_visit       TEXT,
    next_follow_up   DATE,

    -- Clinical
    symptoms         TEXT,
    diagnosis        TEXT,
    medications      TEXT,
    precautions      TEXT,
    tests            TEXT,

    -- Status
    status           TEXT NOT NULL DEFAULT 'good' CHECK (status IN ('critical','warning','good','resolved')),
    adherence        INTEGER NOT NULL DEFAULT 0 CHECK (adherence >= 0 AND adherence <= 100),
    alert_message    TEXT DEFAULT '',
    severity         TEXT NOT NULL DEFAULT 'ON TRACK',
    patient_app      TEXT NOT NULL DEFAULT 'pending' CHECK (patient_app IN ('active','pending','inactive')),

    -- Dos & Don'ts stored as arrays
    dos              TEXT[] DEFAULT '{}',
    donts            TEXT[] DEFAULT '{}',

    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. patient_vitals ────────────────────────────────────────────────────────
CREATE TABLE patient_vitals (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    value      TEXT NOT NULL,
    tone       TEXT NOT NULL DEFAULT 'neutral' CHECK (tone IN ('good','warning','neutral')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. adherence_breakdown ───────────────────────────────────────────────────
CREATE TABLE adherence_breakdown (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    metric     TEXT NOT NULL,
    progress   INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status     TEXT NOT NULL DEFAULT 'Critical' CHECK (status IN ('Critical','Low','Good')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. check_ins ─────────────────────────────────────────────────────────────
CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    day             INTEGER NOT NULL,
    date            DATE NOT NULL,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    missed          BOOLEAN NOT NULL DEFAULT FALSE,
    is_today        BOOLEAN NOT NULL DEFAULT FALSE,

    -- AI Analysis (stored directly on check-in)
    ai_analysis_text   TEXT,
    sent_to_patient    BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(patient_id, day)
);

-- ── 7. image_analyses (linked to check_ins) ──────────────────────────────────
CREATE TABLE image_analyses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id     UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    baseline_url    TEXT,
    current_url     TEXT,
    summary         TEXT NOT NULL DEFAULT '',
    internal_only   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. clinical_kpis (linked to check_ins) ───────────────────────────────────
CREATE TABLE clinical_kpis (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    value       TEXT NOT NULL,
    severity    TEXT NOT NULL DEFAULT 'good' CHECK (severity IN ('critical','warning','good')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. appointments ──────────────────────────────────────────────────────────
CREATE TABLE appointments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    date       DATE NOT NULL,
    time       TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'Follow-up',
    notes      TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Indexes for performance ───────────────────────────────────────────────
CREATE INDEX idx_patients_doctor_id     ON patients(doctor_id);
CREATE INDEX idx_patients_status        ON patients(status);
CREATE INDEX idx_check_ins_patient_id   ON check_ins(patient_id);
CREATE INDEX idx_check_ins_day          ON check_ins(patient_id, day);
CREATE INDEX idx_clinical_kpis_checkin  ON clinical_kpis(check_in_id);
CREATE INDEX idx_image_analyses_checkin ON image_analyses(check_in_id);
CREATE INDEX idx_appointments_patient   ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor    ON appointments(doctor_id);
CREATE INDEX idx_adherence_patient      ON adherence_breakdown(patient_id);
CREATE INDEX idx_vitals_patient         ON patient_vitals(patient_id);

-- ── 11. Updated_at trigger ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER check_ins_updated_at
    BEFORE UPDATE ON check_ins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER adherence_updated_at
    BEFORE UPDATE ON adherence_breakdown
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 12. Disable RLS (access control handled at API layer) ────────────────────
-- The backend uses SERVICE ROLE key which bypasses RLS.
-- If you want to enable Supabase client-side access later, enable RLS and
-- create policies here.
ALTER TABLE doctors            DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients           DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals     DISABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_breakdown DISABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins          DISABLE ROW LEVEL SECURITY;
ALTER TABLE image_analyses     DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_kpis      DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- Schema complete. Now run scripts/seed.py to populate with data.
-- ═══════════════════════════════════════════════════════════════════════════
