-- ==============================================================================
-- MEDIKIOSK — POSTGRESQL / SUPABASE DATABASE SCHEMA
-- SIH 2026 — Problem Statement PS 26047
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Core authentication mapping)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    abha_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    phone VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    preferred_language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    specialization VARCHAR(150),
    room_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PATIENT CASES TABLE
CREATE TABLE IF NOT EXISTS patient_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    token_number VARCHAR(50) NOT NULL,
    chief_complaint TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' 
        CHECK (status IN ('NEW', 'IN_PROGRESS', 'REVIEWED', 'VERIFIED', 'CONSULTATION_COMPLETE')),
    triage_priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE'
        CHECK (triage_priority IN ('ROUTINE', 'URGENT', 'EMERGENCY')),
    current_section VARCHAR(100) DEFAULT 'chief_complaint',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CASE RESPONSES TABLE (History of questions and answers)
CREATE TABLE IF NOT EXISTS case_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'text',
    answer_text TEXT NOT NULL,
    input_modality VARCHAR(30) DEFAULT 'touch' CHECK (input_modality IN ('touch', 'voice', 'text', 'ocr')),
    language VARCHAR(20) DEFAULT 'en',
    confidence_score NUMERIC(4,3),
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MEDICAL HISTORY TABLE
CREATE TABLE IF NOT EXISTS medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES patient_cases(id) ON DELETE SET NULL,
    condition_name VARCHAR(255) NOT NULL,
    diagnosis_year INT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    verification_status VARCHAR(50) DEFAULT 'AI_EXTRACTED' 
        CHECK (verification_status IN ('AI_EXTRACTED', 'PATIENT_REPORTED', 'DOCTOR_VERIFIED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES patient_cases(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    source VARCHAR(50) DEFAULT 'KIOSK_INTAKE' CHECK (source IN ('KIOSK_INTAKE', 'OCR_PRESCRIPTION', 'DOCTOR_ENTERED')),
    verification_status VARCHAR(50) DEFAULT 'REQUIRES_VERIFICATION'
        CHECK (verification_status IN ('REQUIRES_VERIFICATION', 'DOCTOR_VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ALLERGIES TABLE
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction_description TEXT,
    severity VARCHAR(30) DEFAULT 'MODERATE' CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING')),
    verification_status VARCHAR(50) DEFAULT 'REQUIRES_VERIFICATION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES patient_cases(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'OTHER')),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    document_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DOCUMENT EXTRACTIONS TABLE
CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    raw_ocr_text TEXT,
    extracted_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    verification_status VARCHAR(50) DEFAULT 'REQUIRES_VERIFICATION'
        CHECK (verification_status IN ('REQUIRES_VERIFICATION', 'DOCTOR_VERIFIED', 'DOCTOR_EDITED', 'REJECTED')),
    doctor_edits JSONB,
    verified_by UUID REFERENCES doctors(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CASE SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS case_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL UNIQUE REFERENCES patient_cases(id) ON DELETE CASCADE,
    ai_draft_summary TEXT NOT NULL,
    doctor_notes TEXT,
    verification_status VARCHAR(50) DEFAULT 'REQUIRES_VERIFICATION'
        CHECK (verification_status IN ('REQUIRES_VERIFICATION', 'DOCTOR_VERIFIED', 'AMENDED')),
    structured_findings JSONB NOT NULL DEFAULT '{}'::JSONB,
    verified_by UUID REFERENCES doctors(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TRIAGE ALERTS TABLE
CREATE TABLE IF NOT EXISTS triage_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT NOT NULL,
    trigger_criteria JSONB,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'RESOLVED')),
    reviewed_by UUID REFERENCES doctors(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL UNIQUE REFERENCES patient_cases(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    clinical_notes TEXT,
    differential_diagnosis TEXT,
    final_prescription JSONB DEFAULT '[]'::JSONB,
    advised_investigations JSONB DEFAULT '[]'::JSONB,
    follow_up_date DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CONSENTS TABLE
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES patient_cases(id) ON DELETE SET NULL,
    consent_type VARCHAR(100) NOT NULL DEFAULT 'AI_ASSISTED_HISTORY_COLLECTION',
    terms_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    agreed BOOLEAN NOT NULL DEFAULT TRUE,
    ip_or_kiosk_id VARCHAR(100) DEFAULT 'KIOSK_OPD_01',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    case_id UUID REFERENCES patient_cases(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HIGH OPD WORKFLOW EFFICIENCY
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_cases_status_priority ON patient_cases(status, triage_priority, created_at);
CREATE INDEX IF NOT EXISTS idx_cases_patient ON patient_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_case_responses_case ON case_responses(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_triage_alerts_case ON triage_alerts(case_id, status);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SAMPLE DEMO DATA SEED (For instant verification without manual insertions)
INSERT INTO users (id, email, phone, role, full_name) VALUES
('11111111-1111-1111-1111-111111111111', 'doctor@medikiosk.in', '+919876543210', 'DOCTOR', 'Dr. Arvind Sharma'),
('22222222-2222-2222-2222-222222222222', 'patient.ramesh@medikiosk.in', '+919123456780', 'PATIENT', 'Ramesh Kumar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, user_id, license_number, department, specialization, room_number) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'MCI-DEL-2015-84920', 'General Medicine', 'Internal Medicine & Critical Care', 'OPD Room 402')
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, user_id, abha_id, full_name, age, gender, phone, emergency_contact_name, emergency_contact_phone) VALUES
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '91-4820-1948-2831', 'Ramesh Kumar', 54, 'MALE', '+919123456780', 'Suresh Kumar', '+919876501234')
ON CONFLICT (id) DO NOTHING;

INSERT INTO patient_cases (id, patient_id, doctor_id, token_number, chief_complaint, status, triage_priority, current_section) VALUES
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'OPD-402-01', 'Severe epigastric abdominal pain radiating to back for 2 days', 'NEW', 'URGENT', 'chief_complaint')
ON CONFLICT (id) DO NOTHING;
