export type Language = 'en' | 'hi';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type CaseStatus = 'NEW' | 'IN_PROGRESS' | 'REVIEWED' | 'VERIFIED' | 'CONSULTATION_COMPLETE';

export type TriagePriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  abhaId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage: string;
  createdAt: string;
}

export interface PatientCase {
  id: string;
  patientId: string;
  doctorId?: string;
  tokenNumber: string;
  chiefComplaint: string;
  status: CaseStatus;
  triagePriority: TriagePriority;
  currentSection: string;
  createdAt: string;
  completedAt?: string;
  patient?: Patient;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  caseId?: string;
  consentType: string;
  termsVersion: string;
  agreed: boolean;
  ipOrKioskId: string;
  grantedAt: string;
}

export interface DoctorUser {
  id: string;
  email: string;
  role: 'DOCTOR';
  fullName: string;
  department: string;
  roomNumber: string;
}
