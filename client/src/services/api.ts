import { Patient, PatientCase, DoctorUser, ConsentRecord, Gender } from '../types/index';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('medikiosk_doctor_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  }

  async doctorLogin(email: string, password: string): Promise<{ success: boolean; token: string; user: DoctorUser }> {
    const res = await fetch(`${API_BASE}/auth/doctor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Doctor authentication failed');
    
    localStorage.setItem('medikiosk_doctor_token', data.token);
    localStorage.setItem('medikiosk_doctor_user', JSON.stringify(data.user));
    return data;
  }

  async identifyPatient(patient: {
    fullName: string;
    age: number;
    gender: Gender;
    phone: string;
    abhaId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    preferredLanguage?: string;
  }): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to identify patient');
    return data.patient;
  }

  async recordConsent(consent: {
    patientId: string;
    caseId?: string;
    consentType?: string;
    agreed: boolean;
    ipOrKioskId?: string;
  }): Promise<ConsentRecord> {
    const res = await fetch(`${API_BASE}/consents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...consent,
        consentType: consent.consentType || 'AI_ASSISTED_HISTORY_COLLECTION',
        ipOrKioskId: consent.ipOrKioskId || 'KIOSK_OPD_01'
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record consent');
    return data.consent;
  }

  async createCase(data: {
    patientId: string;
    chiefComplaint: string;
    triagePriority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  }): Promise<PatientCase> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Failed to create patient case');
    return body.case;
  }

  async getQueue(status?: string): Promise<PatientCase[]> {
    const url = status && status !== 'ALL' 
      ? `${API_BASE}/cases/queue?status=${encodeURIComponent(status)}` 
      : `${API_BASE}/cases/queue`;

    const res = await fetch(url, {
      headers: {
        ...this.getAuthHeader()
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch patient queue');
    return data.cases || [];
  }

  async getCaseById(id: string): Promise<PatientCase> {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      headers: {
        ...this.getAuthHeader()
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch case');
    return data.case;
  }

  logoutDoctor() {
    localStorage.removeItem('medikiosk_doctor_token');
    localStorage.removeItem('medikiosk_doctor_user');
  }

  getCurrentDoctor(): DoctorUser | null {
    const user = localStorage.getItem('medikiosk_doctor_user');
    return user ? JSON.parse(user) : null;
  }
}

export const api = new ApiService();
