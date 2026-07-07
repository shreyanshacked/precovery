/**
 * PRECOVERY — API Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * All communication with the FastAPI backend goes through this file.
 * Base URL is read from the Vite environment variable VITE_API_URL.
 *
 * To connect to the backend, create a .env file in the frontend root:
 *   VITE_API_URL=http://localhost:8000
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Token storage ─────────────────────────────────────────────────────────────
export const TokenStore = {
  get: () => localStorage.getItem('precovery_token'),
  set: (token) => localStorage.setItem('precovery_token', token),
  clear: () => localStorage.removeItem('precovery_token'),
};

// ── Normalizer: backend (snake_case) → frontend shape (camelCase) ─────────────
// The UI components were built against the mockData.js shape (camelCase,
// nested checkIns/adherenceBreakdown). The backend returns snake_case fields
// matching the Pydantic schemas. This function bridges the two so existing
// components (HomeScreen, PatientDetailScreen, etc.) work unmodified.
function normalizePatient(p) {
  if (!p) return p;
  return {
    ...p,
    bloodGroup: p.blood_group ?? p.bloodGroup,
    avatarUrl: p.avatar_url ?? p.avatarUrl ?? null,
    totalDays: p.total_days ?? p.totalDays,
    lastVisit: p.last_visit ?? p.lastVisit,
    nextFollowUp: p.next_follow_up ?? p.nextFollowUp,
    alertMessage: p.alert_message ?? p.alertMessage ?? '',
    patientApp: p.patient_app ?? p.patientApp,
    admissionDate: p.admission_date ?? p.admissionDate,
    treatmentProtocol: p.treatment_protocol ?? p.treatmentProtocol ?? [],
    adherenceBreakdown: (p.adherence_breakdown ?? p.adherenceBreakdown ?? []).map(a => ({
      metric: a.metric, progress: a.progress, status: a.status,
    })),
    checkIns: (p.check_ins ?? p.checkIns ?? []).map(normalizeCheckIn),
    appointments: (p.appointments ?? []).map(a => ({
      id: a.id, date: a.date, time: a.time, type: a.type, notes: a.notes,
    })),
  };
}

function normalizeCheckIn(ci) {
  if (!ci) return ci;
  return {
    id: ci.id,
    day: ci.day,
    date: ci.date,
    completed: ci.completed,
    missed: ci.missed,
    isToday: ci.is_today ?? ci.isToday,
    aiAnalysis: (ci.ai_analysis_text || ci.aiAnalysis) ? {
      text: ci.ai_analysis_text ?? ci.aiAnalysis?.text ?? '',
      sentToPatient: ci.sent_to_patient ?? ci.aiAnalysis?.sentToPatient ?? false,
      imageAnalysis: ci.image_analysis ? {
        baseline: ci.image_analysis.baseline_url,
        current: ci.image_analysis.current_url,
        summary: ci.image_analysis.summary,
        internalOnly: ci.image_analysis.internal_only,
      } : (ci.aiAnalysis?.imageAnalysis ?? null),
      clinicalKpis: ci.clinical_kpis ?? ci.aiAnalysis?.clinicalKpis ?? [],
    } : null,
  };
}

// ── Base fetch with auth header ────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = TokenStore.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    TokenStore.clear();
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export const AuthAPI = {
  /**
   * Login — returns { access_token, token_type, doctor }
   * Store token via TokenStore.set(response.access_token)
   */
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** Get current doctor profile from JWT */
  me: () => apiFetch('/auth/me'),

  /** Logout — clears server-side session info */
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Patients
// ─────────────────────────────────────────────────────────────────────────────

export const PatientsAPI = {
  /**
   * Get all patients for the logged-in doctor.
   * @param {string} [statusFilter] - 'critical' | 'warning' | 'good' | 'resolved' | 'all'
   * @param {string} [search] - search term
   */
  list: (statusFilter, search) => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    const qs = params.toString();
    return apiFetch(`/patients${qs ? `?${qs}` : ''}`).then(rows => rows.map(normalizePatient));
  },

  /** Get full patient detail */
  get: (patientId) => apiFetch(`/patients/${patientId}`).then(normalizePatient),

  /** Register new patient */
  create: (data) =>
    apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) }).then(normalizePatient),

  /** Update patient clinical data (diagnosis, medications, etc.) */
  update: (patientId, data) =>
    apiFetch(`/patients/${patientId}`, { method: 'PUT', body: JSON.stringify(data) }).then(normalizePatient),

  /** Update adherence breakdown */
  updateAdherence: (patientId, breakdown) =>
    apiFetch(`/patients/${patientId}/adherence`, {
      method: 'PUT',
      body: JSON.stringify({ breakdown }),
    }),

  /** Schedule an appointment */
  scheduleAppointment: (patientId, data) =>
    apiFetch(`/patients/${patientId}/appointments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Push care plan + AI notes to patient app/WhatsApp */
  sendUpdate: (patientId, data = {}) =>
    apiFetch(`/patients/${patientId}/send-update`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctors (Admin only)
// ─────────────────────────────────────────────────────────────────────────────

export const DoctorsAPI = {
  /** List all doctors — admin only */
  list: () => apiFetch('/doctors'),

  /** Create a new doctor account */
  create: (data) =>
    apiFetch('/doctors', { method: 'POST', body: JSON.stringify(data) }),

  /** Assign a patient to a doctor (changes patient.doctor_id) */
  assignPatient: (patientId, doctorId) =>
    apiFetch(`/doctors/assign-patient`, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId }),
    }),
};

export const CheckInsAPI = {
  /** Get all check-ins for a patient */
  list: (patientId) => apiFetch(`/patients/${patientId}/checkins`).then(rows => rows.map(normalizeCheckIn)),

  /** Get check-in for a specific day */
  getDay: (patientId, day) => apiFetch(`/patients/${patientId}/checkins/${day}`).then(normalizeCheckIn),

  /**
   * Doctor updates today's AI analysis.
   * @param {string} patientId
   * @param {{ text, sent_to_patient?, clinical_kpis?, image_analysis? }} data
   */
  updateAIAnalysis: (patientId, data) =>
    apiFetch(`/patients/${patientId}/ai-analysis`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(normalizeCheckIn),
};
