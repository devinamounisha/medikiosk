export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type CaseStatus = 'NEW' | 'IN_PROGRESS' | 'REVIEWED' | 'VERIFIED' | 'CONSULTATION_COMPLETE';

export type TriagePriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export type VerificationStatus = 'AI_EXTRACTED' | 'REQUIRES_VERIFICATION' | 'DOCTOR_VERIFIED' | 'DOCTOR_EDITED' | 'REJECTED';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  userId?: string;
  abhaId?: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  department: string;
  specialization?: string;
  roomNumber?: string;
  isActive: boolean;
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

export interface CaseResponse {
  id: string;
  caseId: string;
  section: string;
  questionText: string;
  questionType: string;
  answerText: string;
  inputModality: 'touch' | 'voice' | 'text' | 'ocr';
  language: string;
  confidenceScore?: number;
  isAiGenerated: boolean;
  createdAt: string;
}
