/**
 * PRECOVERY — Mock Data Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * All data here is placeholder / demo only.
 * When the backend is ready, replace these with real API calls via src/services/api.js
 * The shape of each object mirrors the expected API response contract.
 */

export const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Priya Mehta',
  initials: 'PM',
  specialty: 'Dermatologist',
  clinic: 'SkinCare Advanced',
  avatarUrl: null, // Will be provided by backend
};

export const MOCK_PATIENTS = [
  {
    id: 'pat_001',
    name: 'Meera Kapoor',
    initials: 'MK',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 98112 34567',
    avatarUrl: null,
    procedure: 'CO2 Laser',
    condition: 'Acne Vulgaris',
    status: 'critical', // critical | warning | good | resolved
    adherence: 42,
    phase: 'Session 1 of 4',
    day: 7,
    totalDays: 14,
    lastVisit: '15 May',
    nextFollowUp: '29 May 2025',
    admissionDate: '20-05-2025',
    alertMessage: 'Grade 3 erythema detected. Grade 2 oedema persisting beyond expected timeline. Confirmed blistering at Day 3 in Fitzpatrick IV skin. HIGH PIH risk. Immediate physician review required.',
    severity: 'GRADE 3',
    symptoms: 'Active comedones, papules, post-inflammatory hyperpigmentation. Melasma-prone Fitzpatrick IV skin. PIH risk elevated.',
    diagnosis: 'Acne Vulgaris — Hormonal type. Grade III severity. Active PIH lesions present.',
    medications: 'Tretinoin 0.025% nightly · Clindamycin gel BD · Sunscreen SPF 50+ AM',
    precautions: 'No sun 72hr. No hair wash 48hr. No swimming 2 weeks. Avoid abrasive scrubs.',
    tests: 'Hormonal panel, CBC. Ferritin, Vit D3, B12.',
    treatmentProtocol: ['CO2 Laser', 'Chemical Peel'],
    vitals: [
      { label: 'Pulse', value: '82 bpm', tone: 'good' },
      { label: 'BP', value: '118/76', tone: 'good' },
      { label: 'SPO2', value: '98%', tone: 'good' },
      { label: 'Weight', value: '58 kg', tone: 'neutral' },
    ],
    adherenceBreakdown: [
      { metric: 'Medication', progress: 38, status: 'Critical' },
      { metric: 'Check-ins', progress: 57, status: 'Low' },
      { metric: 'Photos', progress: 83, status: 'Good' },
      { metric: 'Precautions', progress: 28, status: 'Critical' },
    ],
    checkIns: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      date: `${22 + i} May 2025`,
      completed: i < 5,
      missed: i === 3 || i === 4,
      isToday: i === 6,
      aiAnalysis: i < 7 ? {
        text: i === 6
          ? 'Day 7 — URGENT: Grade 3 erythema detected. Grade 2 oedema persisting beyond expected timeline. Confirmed blistering at Day 3 in Fitzpatrick IV skin. HIGH PIH risk. Immediate physician review required. Consider prednisolone 0.5mg/kg × 3 days. Do NOT proceed with Session 2 until further review.'
          : `Day ${i + 1} — Recovery progressing. Mild erythema noted. Patient reported mild discomfort. Adherence to post-care protocol satisfactory. Continue current regimen.`,
        sentToPatient: i < 6,
        imageAnalysis: {
          baseline: null, // Will be patient photo URL from backend
          current: null,
          summary: i === 6
            ? 'Visible Grade 3 erythema vs baseline. Oedema persisting T-zone. PIH markers elevated for Fitzpatrick IV. Blistering resolved but crusting present.'
            : 'Mild erythema visible. No significant oedema. Healing progressing within normal parameters.',
          internalOnly: true,
        },
        clinicalKpis: i === 6 ? [
          { label: 'Erythema', value: 'Gr.3', severity: 'critical' },
          { label: 'PIH Risk', value: 'High', severity: 'critical' },
          { label: 'Oedema', value: 'Gr.2', severity: 'warning' },
          { label: 'Redness', value: '28%↑', severity: 'warning' },
          { label: 'Dryness', value: 'Mild', severity: 'good' },
          { label: 'Blistering', value: 'Yes', severity: 'critical' },
        ] : [
          { label: 'Erythema', value: 'Gr.1', severity: 'good' },
          { label: 'PIH Risk', value: 'Low', severity: 'good' },
          { label: 'Oedema', value: 'None', severity: 'good' },
          { label: 'Dryness', value: 'Mild', severity: 'good' },
        ],
      } : null,
    })),
    dos: ['Apply moisturiser nightly', 'Use SPF 50+ every morning', 'Take medications as prescribed', 'Drink 2–3L water daily', 'Sleep 7–8 hrs'],
    donts: ['Never skip sunscreen', 'No alcohol/smoking', 'No chemical treatments', 'No heating tools'],
    appointments: [
      { date: '29 May 2025', time: '10:00 AM', type: 'Follow-up', notes: 'Post Session 1 review' },
    ],
    patientApp: 'active',
  },
  {
    id: 'pat_002',
    name: 'Arjun Sharma',
    initials: 'AS',
    age: 34,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98112 34568',
    avatarUrl: null,
    procedure: 'PRP Therapy',
    condition: 'Androgenetic Alopecia (Male)',
    status: 'warning',
    adherence: 68,
    phase: 'Session 2 of 6',
    day: 12,
    totalDays: 21,
    lastVisit: '10 May',
    nextFollowUp: '28 Jun 2025',
    admissionDate: '20-05-2025',
    alertMessage: 'Norwood Stage III progression detected. Density dropped 12% from baseline. Hair fall increased last 6 months.',
    severity: 'MODERATE',
    symptoms: 'Diffuse hair thinning at crown and temporal regions. Increased hair fall last 6 months.',
    diagnosis: 'Androgenetic Alopecia — Norwood Stage III Vertex. Miniaturisation confirmed. Density 148 hairs/cm².',
    medications: 'Minoxidil 5% topical daily · Finasteride 1mg oral daily · Biotin 10mg oral daily',
    precautions: 'No sun 72hr. No hair wash 48hr. No swimming 2 weeks.',
    tests: 'DHT, Testosterone. Ferritin, Vit D3, B12.',
    treatmentProtocol: ['PRP Therapy'],
    vitals: [
      { label: 'Pulse', value: '76 bpm', tone: 'good' },
      { label: 'BP', value: '128/82', tone: 'warning' },
      { label: 'SPO2', value: '98%', tone: 'good' },
      { label: 'Weight', value: '76 kg', tone: 'neutral' },
    ],
    adherenceBreakdown: [
      { metric: 'Medication', progress: 72, status: 'Low' },
      { metric: 'Check-ins', progress: 65, status: 'Low' },
      { metric: 'Photos', progress: 78, status: 'Good' },
      { metric: 'Precautions', progress: 55, status: 'Low' },
    ],
    checkIns: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      date: `${8 + i} May 2025`,
      completed: i < 10,
      missed: i === 7,
      isToday: i === 11,
      aiAnalysis: i < 12 ? {
        text: `Day ${i + 1} — Hair density evaluation: moderate response to PRP. Continue protocol as prescribed.`,
        sentToPatient: i < 11,
        imageAnalysis: null,
        clinicalKpis: [
          { label: 'Density', value: '148/cm²', severity: 'warning' },
          { label: 'Shedding', value: 'Mod.', severity: 'warning' },
        ],
      } : null,
    })),
    dos: ['Apply Minoxidil nightly', 'Massage scalp 2 min', 'Take meds correctly', 'Protein-rich diet', 'Sleep 7–8hrs · Drink 2–3L'],
    donts: ['Never skip Finasteride', 'No alcohol/smoking', 'No chemical treatments', 'No heating tools', 'No pools 2wks post-PRP'],
    appointments: [
      { date: '28 Jun 2025', time: '11:00 AM', type: 'PRP Session 3', notes: 'Density re-evaluation' },
    ],
    patientApp: 'pending',
  },
  {
    id: 'pat_003',
    name: 'Sneha Reddy',
    initials: 'SR',
    age: 31,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 99000 12345',
    avatarUrl: null,
    procedure: 'Microneedling',
    condition: 'Post-Acne Scarring',
    status: 'good',
    adherence: 91,
    phase: 'Session 3 of 3',
    day: 21,
    totalDays: 21,
    lastVisit: '20 May',
    nextFollowUp: '20 Jun 2025',
    admissionDate: '01-05-2025',
    alertMessage: '',
    severity: 'ON TRACK',
    symptoms: 'Rolling scars cheek region. Mild textural irregularity.',
    diagnosis: 'Post-acne scarring — Type IV. Boxcar and rolling variants. 70% improvement from baseline.',
    medications: 'Hyaluronic acid serum AM/PM · Vitamin C 10% serum AM · SPF 50+',
    precautions: 'Avoid direct sun for 5 days. No harsh exfoliants.',
    tests: 'None required at this stage.',
    treatmentProtocol: ['Microneedling', 'PRP + Microneedling'],
    vitals: [],
    adherenceBreakdown: [
      { metric: 'Medication', progress: 95, status: 'Good' },
      { metric: 'Check-ins', progress: 88, status: 'Good' },
      { metric: 'Photos', progress: 92, status: 'Good' },
      { metric: 'Precautions', progress: 90, status: 'Good' },
    ],
    checkIns: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      date: `${1 + i} May 2025`,
      completed: true,
      missed: false,
      isToday: i === 20,
      aiAnalysis: {
        text: `Day ${i + 1} — Excellent recovery trajectory. Scar depth reducing per assessment. Patient highly compliant.`,
        sentToPatient: true,
        imageAnalysis: null,
        clinicalKpis: [
          { label: 'Scar Depth', value: '-70%', severity: 'good' },
          { label: 'Texture', value: 'Smooth', severity: 'good' },
        ],
      },
    })),
    dos: ['Continue serum routine', 'SPF every morning', 'Stay hydrated'],
    donts: ['No harsh scrubs', 'No sun exposure'],
    appointments: [],
    patientApp: 'active',
  },
];

export const ADHERENCE_STATUS_COLOR = {
  Critical: '#ff4d6d',
  Low: '#ffb84d',
  Good: '#4ade80',
};

export const STATUS_CONFIG = {
  critical: { color: '#ff4d6d', label: 'Critical', bg: 'rgba(255,77,109,0.12)' },
  warning: { color: '#ffb84d', label: 'Moderate', bg: 'rgba(255,184,77,0.12)' },
  good: { color: '#4ade80', label: 'On Track', bg: 'rgba(74,222,128,0.12)' },
  resolved: { color: '#60a5fa', label: 'Resolved', bg: 'rgba(96,165,250,0.12)' },
};
