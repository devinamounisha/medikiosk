import { supabase } from '../config/supabase.js';
import {
  Patient,
  PatientCase,
  Doctor,
  ConsentRecord,
  User
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// IN-MEMORY SEED DATA
// ============================================================

const mockUsers: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'doctor@medikiosk.in',
    phone: '+919876543210',
    role: 'DOCTOR',
    fullName: 'Dr. Arvind Sharma',
    createdAt: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'patient.ramesh@medikiosk.in',
    phone: '+919123456780',
    role: 'PATIENT',
    fullName: 'Ramesh Kumar',
    createdAt: new Date().toISOString()
  }
];

const mockDoctors: Doctor[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    userId: '11111111-1111-1111-1111-111111111111',
    licenseNumber: 'MCI-DEL-2015-84920',
    department: 'General Medicine',
    specialization: 'Internal Medicine & Critical Care',
    roomNumber: 'OPD Room 402',
    isActive: true
  }
];

const mockPatients: Patient[] = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    userId: '22222222-2222-2222-2222-222222222222',
    abhaId: '91-4820-1948-2831',
    fullName: 'Ramesh Kumar',
    age: 54,
    gender: 'MALE',
    phone: '+919123456780',
    emergencyContactName: 'Suresh Kumar',
    emergencyContactPhone: '+919876501234',
    preferredLanguage: 'en',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444445',
    abhaId: '91-1029-3847-5610',
    fullName: 'Sunita Devi',
    age: 48,
    gender: 'FEMALE',
    phone: '+919811223344',
    preferredLanguage: 'hi',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const mockCases: PatientCase[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    patientId: '44444444-4444-4444-4444-444444444444',
    doctorId: '33333333-3333-3333-3333-333333333333',
    tokenNumber: 'OPD-402-01',
    chiefComplaint:
      'Severe epigastric abdominal pain radiating to back for 2 days',
    status: 'NEW',
    triagePriority: 'URGENT',
    currentSection: 'chief_complaint',
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    patient: mockPatients[0]
  },
  {
    id: '55555555-5555-5555-5555-555555555556',
    patientId: '44444444-4444-4444-4444-444444444445',
    doctorId: '33333333-3333-3333-3333-333333333333',
    tokenNumber: 'OPD-402-02',
    chiefComplaint:
      'Persistent dry cough and mild breathlessness on exertion',
    status: 'IN_PROGRESS',
    triagePriority: 'ROUTINE',
    currentSection: 'history_of_present_illness',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    patient: mockPatients[1]
  }
];

const mockConsents: ConsentRecord[] = [];

// ============================================================
// DATA STORE
// ============================================================

export class DataStore {

  // ==========================================================
  // FIND OR CREATE PATIENT
  // ==========================================================

  static async findOrCreatePatient(data: {
    fullName: string;
    age: number;
    gender:
      | 'MALE'
      | 'FEMALE'
      | 'OTHER'
      | 'PREFER_NOT_TO_SAY';
    phone: string;
    abhaId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    preferredLanguage?: string;
  }): Promise<Patient> {

    // --------------------------
    // SUPABASE
    // --------------------------

    if (supabase) {
      const { data: existing, error } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', data.phone)
        .maybeSingle();

      if (existing && !error) {
        return {
          id: existing.id,
          userId: existing.user_id,
          abhaId: existing.abha_id,
          fullName: existing.full_name,
          age: existing.age,
          gender: existing.gender,
          phone: existing.phone,
          emergencyContactName: existing.emergency_contact_name,
          emergencyContactPhone: existing.emergency_contact_phone,
          preferredLanguage: existing.preferred_language,
          createdAt: existing.created_at
        };
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('patients')
        .insert({
          full_name: data.fullName,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          abha_id: data.abhaId || null,
          emergency_contact_name: data.emergencyContactName || null,
          emergency_contact_phone:
            data.emergencyContactPhone || null,
          preferred_language: data.preferredLanguage || 'en'
        })
        .select()
        .single();

      if (insertErr || !inserted) {
        throw new Error(
          `Failed to create patient in Supabase: ${
            insertErr?.message || 'Unknown error'
          }`
        );
      }

      return {
        id: inserted.id,
        userId: inserted.user_id,
        abhaId: inserted.abha_id,
        fullName: inserted.full_name,
        age: inserted.age,
        gender: inserted.gender,
        phone: inserted.phone,
        emergencyContactName: inserted.emergency_contact_name,
        emergencyContactPhone: inserted.emergency_contact_phone,
        preferredLanguage: inserted.preferred_language,
        createdAt: inserted.created_at
      };
    }

    // --------------------------
    // IN-MEMORY FALLBACK
    // --------------------------

    let patient = mockPatients.find(
      (p) =>
        p.phone === data.phone ||
        (data.abhaId && p.abhaId === data.abhaId)
    );

    if (!patient) {
      patient = {
        id: uuidv4(),
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        abhaId: data.abhaId,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        preferredLanguage: data.preferredLanguage || 'en',
        createdAt: new Date().toISOString()
      };

      mockPatients.push(patient);
    }

    return patient;
  }

  // ==========================================================
  // CREATE CASE
  // ==========================================================

  static async createCase(
    patientId: string,
    chiefComplaint: string,
    triagePriority:
      | 'ROUTINE'
      | 'URGENT'
      | 'EMERGENCY' = 'ROUTINE'
  ): Promise<PatientCase> {

    const tokenNumber = `OPD-402-${String(
      mockCases.length + 1
    ).padStart(2, '0')}`;

    // --------------------------
    // SUPABASE
    // --------------------------

    if (supabase) {
      const { data, error } = await supabase
        .from('patient_cases')
        .insert({
          patient_id: patientId,
          doctor_id: '33333333-3333-3333-3333-333333333333',
          token_number: tokenNumber,
          chief_complaint: chiefComplaint,
          status: 'NEW',
          triage_priority: triagePriority,
          current_section: 'chief_complaint'
        })
        .select('*, patient:patients(*)')
        .single();

      if (error || !data) {
        throw new Error(
          `Failed to create case in Supabase: ${
            error?.message || 'Unknown error'
          }`
        );
      }

      return {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        tokenNumber: data.token_number,
        chiefComplaint: data.chief_complaint,
        status: data.status,
        triagePriority: data.triage_priority,
        currentSection: data.current_section,
        createdAt: data.created_at,
        patient: data.patient
          ? {
              id: data.patient.id,
              fullName: data.patient.full_name,
              age: data.patient.age,
              gender: data.patient.gender,
              phone: data.patient.phone,
              preferredLanguage:
                data.patient.preferred_language,
              createdAt: data.patient.created_at
            }
          : undefined
      };
    }

    // --------------------------
    // IN-MEMORY FALLBACK
    // --------------------------

    const patient = mockPatients.find(
      (p) => p.id === patientId
    );

    const newCase: PatientCase = {
      id: uuidv4(),
      patientId,
      doctorId: '33333333-3333-3333-3333-333333333333',
      tokenNumber,
      chiefComplaint,
      status: 'NEW',
      triagePriority,
      currentSection: 'chief_complaint',
      createdAt: new Date().toISOString(),
      patient
    };

    mockCases.unshift(newCase);

    return newCase;
  }

  // ==========================================================
  // GET QUEUE
  // ==========================================================

  static async getQueue(
    statusFilter?: string
  ): Promise<PatientCase[]> {

    if (supabase) {
      let query = supabase
        .from('patient_cases')
        .select('*, patient:patients(*)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error(
          'Supabase queue error, falling back to mock:',
          error
        );
      } else if (data) {
        return data.map((d: any) => ({
          id: d.id,
          patientId: d.patient_id,
          doctorId: d.doctor_id,
          tokenNumber: d.token_number,
          chiefComplaint: d.chief_complaint,
          status: d.status,
          triagePriority: d.triage_priority,
          currentSection: d.current_section,
          createdAt: d.created_at,
          patient: d.patient
            ? {
                id: d.patient.id,
                fullName: d.patient.full_name,
                age: d.patient.age,
                gender: d.patient.gender,
                phone: d.patient.phone,
                preferredLanguage:
                  d.patient.preferred_language,
                createdAt: d.patient.created_at
              }
            : undefined
        }));
      }
    }

    if (statusFilter && statusFilter !== 'ALL') {
      return mockCases.filter(
        (c) => c.status === statusFilter
      );
    }

    return [...mockCases];
  }

  // ==========================================================
  // GET CASE BY ID
  // ==========================================================

  static async getCaseById(
    caseId: string
  ): Promise<PatientCase | null> {

    if (supabase) {
      const { data, error } = await supabase
        .from('patient_cases')
        .select('*, patient:patients(*)')
        .eq('id', caseId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          patientId: data.patient_id,
          doctorId: data.doctor_id,
          tokenNumber: data.token_number,
          chiefComplaint: data.chief_complaint,
          status: data.status,
          triagePriority: data.triage_priority,
          currentSection: data.current_section,
          createdAt: data.created_at,
          patient: data.patient
            ? {
                id: data.patient.id,
                fullName: data.patient.full_name,
                age: data.patient.age,
                gender: data.patient.gender,
                phone: data.patient.phone,
                preferredLanguage:
                  data.patient.preferred_language,
                createdAt: data.patient.created_at
              }
            : undefined
        };
      }
    }

    return (
      mockCases.find((c) => c.id === caseId) ||
      null
    );
  }

  // ==========================================================
  // SAVE CONSENT
  // ==========================================================

  static async saveConsent(data: {
    patientId: string;
    caseId?: string;
    consentType: string;
    agreed: boolean;
    ipOrKioskId: string;
  }): Promise<ConsentRecord> {

    const record: ConsentRecord = {
      id: uuidv4(),
      patientId: data.patientId,
      caseId: data.caseId,
      consentType: data.consentType,
      termsVersion: 'v1.0',
      agreed: data.agreed,
      ipOrKioskId: data.ipOrKioskId,
      grantedAt: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('consents')
        .insert({
          patient_id: data.patientId,
          case_id: data.caseId || null,
          consent_type: data.consentType,
          terms_version: 'v1.0',
          agreed: data.agreed,
          ip_or_kiosk_id: data.ipOrKioskId
        });

      if (error) {
        console.error(
          'Supabase consent error:',
          error
        );
      }
    }

    mockConsents.push(record);

    return record;
  }

  // ==========================================================
  // SAVE INTERVIEW RESPONSE
  // ==========================================================

  static async saveResponse(
    caseId: string,
    turn: {
      questionText: string;
      answerText: string;
      section: string;
      inputModality?: string;
      confidenceScore?: number;
      createdAt?: string;
    }
  ): Promise<void> {

    const record = {
      case_id: caseId,
      question_text: turn.questionText,
      answer_text: turn.answerText,
      section: turn.section,
      input_modality:
        turn.inputModality ?? null,
      confidence_score:
        turn.confidenceScore ?? null,
      created_at:
        turn.createdAt ?? new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('case_responses')
        .insert(record);

      if (error) {
        console.error(
          'Supabase saveResponse error:',
          error
        );
      }

      return;
    }

    // In-memory fallback
    if ((global as any).mockResponses === undefined) {
      (global as any).mockResponses = [];
    }

    (global as any).mockResponses.push({
      id: uuidv4(),
      ...record
    });
  }

  // ==========================================================
  // GET INTERVIEW RESPONSES
  // ==========================================================

  static async getResponses(
    caseId: string
  ): Promise<any[]> {

    if (supabase) {
      const { data, error } = await supabase
        .from('case_responses')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', {
          ascending: true
        });

      if (error) {
        console.error(
          'Supabase getResponses error:',
          error
        );
        return [];
      }

      return data || [];
    }

    const mockResponses =
      (global as any).mockResponses || [];

    return mockResponses.filter(
      (r: any) => r.case_id === caseId
    );
  }

  // ==========================================================
  // SAVE CASE SUMMARY
  // ==========================================================

  static async saveSummary(
    caseId: string,
    summary: {
      text: string;
      generatedAt?: string;
      model?: string;
    }
  ): Promise<void> {

    const record = {
      case_id: caseId,
      summary_text: summary.text,
      generated_at:
        summary.generatedAt ??
        new Date().toISOString(),
      model:
        summary.model ?? 'local-mock'
    };

    if (supabase) {
      const { error } = await supabase
        .from('case_summaries')
        .upsert(record, {
          onConflict: 'case_id'
        });

      if (error) {
        console.error(
          'Supabase saveSummary error:',
          error
        );
      }

      return;
    }

    if ((global as any).mockSummaries === undefined) {
      (global as any).mockSummaries = [];
    }

    const summaries =
      (global as any).mockSummaries;

    const existing = summaries.find(
      (s: any) => s.case_id === caseId
    );

    if (existing) {
      Object.assign(existing, record);
    } else {
      summaries.push({
        id: uuidv4(),
        ...record
      });
    }
  }

  // ==========================================================
  // GET CASE SUMMARY
  // ==========================================================

  static async getSummary(
    caseId: string
  ): Promise<{
    text: string;
    generatedAt: string;
    model: string;
  } | null> {

    if (supabase) {
      const { data, error } = await supabase
        .from('case_summaries')
        .select(
          'summary_text, generated_at, model'
        )
        .eq('case_id', caseId)
        .maybeSingle();

      if (error) {
        console.error(
          'Supabase getSummary error:',
          error
        );
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        text: data.summary_text,
        generatedAt: data.generated_at,
        model: data.model
      };
    }

    const mockSummaries =
      (global as any).mockSummaries || [];

    const found = mockSummaries.find(
      (s: any) => s.case_id === caseId
    );

    if (!found) {
      return null;
    }

    return {
      text: found.summary_text,
      generatedAt: found.generated_at,
      model: found.model
    };
  }

  // ==========================================================
  // UPDATE CASE STATUS
  // ==========================================================
  // IMPORTANT:
  // This method MUST be async because it uses await.
  // ==========================================================

  static async updateCaseStatus(
    caseId: string,
    status: string
  ): Promise<void> {

    if (supabase) {
      const { error } = await supabase
        .from('patient_cases')
        .update({
          status
        })
        .eq('id', caseId);

      if (error) {
        console.error(
          'Supabase updateCaseStatus error:',
          error
        );
      }
    }

    // In-memory fallback
    const idx = mockCases.findIndex(
      (c) => c.id === caseId
    );

    if (idx !== -1) {
      (mockCases[idx] as any).status = status;
    }
  }
}