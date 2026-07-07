import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CTAButton, Input } from '../components/UI';
import { PatientsAPI } from '../services/api';

const TREATMENT_PROTOCOLS = [
  'CO2 Laser', 'Chemical Peel', 'Microneedling', 'PRP Therapy',
  'Hair Transplant (FUE)', 'Hair Transplant (FUT)', 'PRP + Transplant',
  'Botox', 'Dermal Fillers', 'IPL Photofacial',
];

const CONDITIONS = [
  'Acne Vulgaris', 'Post-Acne Scarring', 'Androgenetic Alopecia (Male)',
  'Androgenetic Alopecia (Female)', 'Melasma', 'Rosacea',
  'Hyperpigmentation', 'Eczema/Dermatitis', 'Psoriasis', 'Alopecia Areata',
  'Other',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function UploadStep({ onContinue }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f) {
    if (f && f.type === 'application/pdf') setFile(f);
  }

  return (
    <div className="fade-up pb-28 px-4">
      <div className="py-5">
        <h1 className="text-[18px] font-bold text-[var(--t1)]">Add New Patient</h1>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--t3)' }}>Upload prescription to auto-fill patient form</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className="rounded-2xl border-2 border-dashed p-8 text-center transition-all mb-6 cursor-pointer"
        style={{ borderColor: dragging ? 'var(--teal)' : 'var(--stroke)', background: dragging ? 'rgba(45,212,191,0.05)' : 'var(--surface)' }}
        onClick={() => document.getElementById('prescription-upload').click()}
      >
        <input
          id="prescription-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--teal)' }}>{file.name}</p>
            <p className="text-[11px]" style={{ color: 'var(--t3)' }}>Prescription uploaded · AI will extract details</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card2)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--t1)]">Upload Prescription</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>PDF, JPG, or PNG · AI will auto-fill the form</p>
            </div>
            <div className="border border-dashed rounded-xl px-4 py-2" style={{ borderColor: 'var(--stroke)' }}>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--teal)' }}>Tap to browse files</p>
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-2xl border p-4 mb-6 flex gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(96,165,250,0.15)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--t1)] mb-0.5">AI-Powered Extraction</p>
          <p className="text-[11px] leading-[1.55]" style={{ color: 'var(--t3)' }}>
            Upload patient prescription and our AI will automatically extract name, medications, diagnosis, and dosage details.
            {/* Will call API: POST /api/ai/extract-prescription */}
          </p>
        </div>
      </div>

      <CTAButton onClick={onContinue}>Continue to Patient Form →</CTAButton>
      {file && (
        <p className="text-[10px] text-center mt-2" style={{ color: 'var(--teal)' }}>✓ Prescription ready · Form will be AI-filled</p>
      )}
      {!file && (
        <button onClick={onContinue} className="w-full mt-2 py-2 text-[12px]" style={{ color: 'var(--t3)' }}>
          Skip — fill form manually
        </button>
      )}
    </div>
  );
}

function PatientForm({ onRegister }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Female',
    bloodGroup: 'O+',
    admissionDate: new Date().toISOString().split('T')[0],
    pulse: '',
    bp: '',
    spo2: '',
    weight: '',
    condition: '',
    treatmentProtocol: [],
    symptoms: '',
    diagnosis: '',
    medications: '',
    precautions: '',
    tests: '',
    nextFollowUp: '',
    dos: '',
    donts: '',
  });
  const [photoTaken, setPhotoTaken] = useState(false);
  const [page, setPage] = useState(1); // 1 = info, 2 = care

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function toggleProtocol(p) {
    setForm(prev => ({
      ...prev,
      treatmentProtocol: prev.treatmentProtocol.includes(p)
        ? prev.treatmentProtocol.filter(x => x !== p)
        : [...prev.treatmentProtocol, p],
    }));
  }

  const isPage1Valid = form.name && form.phone && form.condition && form.treatmentProtocol.length > 0;

  if (page === 2) {
    return (
      <div className="fade-up pb-28 px-4">
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => setPage(1)} className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div className="text-[10px] text-[var(--t3)] font-semibold uppercase tracking-[1px]">Page 2 of 2</div>
            <h2 className="text-[16px] font-bold text-[var(--t1)]">Care Instructions</h2>
          </div>
          <div className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(45,212,191,0.15)', color: 'var(--teal)' }}>✨ AI-recommended</div>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Symptoms" value={form.symptoms} onChange={e => set('symptoms', e.target.value)} placeholder="Presenting symptoms…" multiline />
          <Input label="Diagnosis" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="Clinical diagnosis…" multiline />
          <Input label="Medications" value={form.medications} onChange={e => set('medications', e.target.value)} placeholder="Medications and dosage…" multiline />
          <Input label="Precautions" value={form.precautions} onChange={e => set('precautions', e.target.value)} placeholder="Patient precautions…" multiline />
          <Input label="Tests Ordered" value={form.tests} onChange={e => set('tests', e.target.value)} placeholder="Blood tests, imaging…" />
          <Input label="Next Follow-up Date" value={form.nextFollowUp} onChange={e => set('nextFollowUp', e.target.value)} type="date" />

          {/* Dos & Don'ts */}
          <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Dos & Don'ts</span>
              <span className="text-[9px] font-semibold text-[var(--t3)]">AI-recommended · editable</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1px] mb-2" style={{ color: 'var(--green)' }}>✅ DOS</div>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border px-2.5 py-2 text-[11px] outline-none focus:border-[var(--teal)] resize-none"
                  style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t2)' }}
                  value={form.dos}
                  onChange={e => set('dos', e.target.value)}
                  placeholder={"• Apply sunscreen\n• Stay hydrated\n• Sleep 7–8 hrs"}
                />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1px] mb-2" style={{ color: 'var(--red)' }}>❌ DON'TS</div>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border px-2.5 py-2 text-[11px] outline-none focus:border-[var(--teal)] resize-none"
                  style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t2)' }}
                  value={form.donts}
                  onChange={e => set('donts', e.target.value)}
                  placeholder={"• No alcohol\n• No direct sun\n• No chemical peels"}
                />
              </div>
            </div>
          </div>

          <CTAButton onClick={() => onRegister(form)}>✓ Register Patient</CTAButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up pb-28 px-4">
      <div className="flex items-center gap-3 py-5">
        <div>
          <div className="text-[10px] text-[var(--t3)] font-semibold uppercase tracking-[1px]">Page 1 of 2</div>
          <h2 className="text-[16px] font-bold text-[var(--t1)]">Patient Information</h2>
        </div>
        <div className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--teal)' }}>AI-filled</div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Photo */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <div className="text-[10px] font-bold uppercase tracking-[1px] mb-3 text-[var(--t3)]">Patient Photo</div>
          <div className="flex gap-3">
            <button
              onClick={() => setPhotoTaken(false)}
              className="flex-1 py-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Take Photo
            </button>
            <button
              onClick={() => setPhotoTaken(true)}
              className="w-20 h-12 rounded-xl border flex items-center justify-center flex-shrink-0"
              style={{
                background: photoTaken ? 'rgba(45,212,191,0.15)' : 'var(--card2)',
                borderColor: photoTaken ? 'var(--teal)' : 'var(--stroke)',
                color: photoTaken ? 'var(--teal)' : 'var(--t3)'
              }}
            >
              <span className="text-[10px] font-bold">{photoTaken ? '✓ Captured' : 'Upload'}</span>
            </button>
          </div>
        </div>

        {/* Basic info */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Patient Information</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--teal)' }}>✦ Extracted</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Patient full name" /></div>
              <Input label="Phone *" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" />
              <Input label="Age" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Years" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Gender</label>
                <select
                  className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t1)' }}
                  value={form.gender} onChange={e => set('gender', e.target.value)}
                >
                  {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Blood Group</label>
                <select
                  className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t1)' }}
                  value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}
                >
                  {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <Input label="Admission Date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} type="date" />
          </div>
        </div>

        {/* Vitals */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Vitals at Admission</span>
            <button className="text-[10px] font-semibold" style={{ color: 'var(--teal)' }}>+ Add</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Pulse (bpm)" value={form.pulse} onChange={e => set('pulse', e.target.value)} placeholder="82 bpm" />
            <Input label="BP (mmHg)" value={form.bp} onChange={e => set('bp', e.target.value)} placeholder="120/80" />
            <Input label="SPO2 (%)" value={form.spo2} onChange={e => set('spo2', e.target.value)} placeholder="98%" />
            <Input label="Weight (kg)" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="65 kg" />
          </div>
        </div>

        {/* Disease & Treatment */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <div className="text-[10px] font-bold uppercase tracking-[1px] mb-3 text-[var(--t3)]">Disease & Treatment</div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Condition *</label>
              <select
                className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
                style={{ background: 'var(--card2)', borderColor: 'var(--stroke)', color: form.condition ? 'var(--t1)' : 'var(--t3)' }}
                value={form.condition} onChange={e => set('condition', e.target.value)}
              >
                <option value="">Select condition…</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)] block mb-2">Treatment Protocol *</label>
              <div className="flex flex-wrap gap-2">
                {TREATMENT_PROTOCOLS.map(tp => (
                  <button
                    key={tp}
                    onClick={() => toggleProtocol(tp)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1.5"
                    style={
                      form.treatmentProtocol.includes(tp)
                        ? { background: 'rgba(45,212,191,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
                        : { background: 'var(--card2)', borderColor: 'var(--stroke)', color: 'var(--t3)' }
                    }
                  >
                    {form.treatmentProtocol.includes(tp) && <span>✓</span>}
                    {tp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl text-[13px] font-semibold border" style={{ background: 'transparent', borderColor: 'var(--stroke)', color: 'var(--t3)' }}>
            Discard
          </button>
          <button
            onClick={() => isPage1Valid && setPage(2)}
            className="flex-[2] py-3 rounded-xl text-[13px] font-bold transition-all"
            style={{
              background: isPage1Valid ? 'linear-gradient(135deg,#2dd4bf,#0ea5e9)' : 'var(--card2)',
              color: isPage1Valid ? '#06181a' : 'var(--t3)',
            }}
          >
            Care Instructions →
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ patient, onAddAnother, onDashboard }) {
  return (
    <div className="fade-up flex flex-col items-center justify-center min-h-screen px-4 pb-28">
      <div className="text-center mb-8">
        <h1 className="text-[20px] font-bold text-[var(--t1)]">Patient Registered</h1>
      </div>

      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', boxShadow: '0 0 40px -8px var(--teal)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#06181a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <p className="text-[16px] font-semibold text-[var(--t1)] mb-1">Patient Registered!</p>
      <p className="text-[13px] mb-1" style={{ color: 'var(--t2)' }}>
        <span style={{ color: 'var(--teal)' }}>{patient?.name || 'Patient'}</span> registered successfully.
      </p>
      <p className="text-[12px] mb-6" style={{ color: 'var(--t3)' }}>WhatsApp invite sent for app activation.</p>

      <div className="border rounded-full px-4 py-2 mb-8" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'var(--amber)' }}>⏳ Registered — Activation Pending</span>
      </div>

      {/* Summary */}
      <div className="w-full rounded-2xl border p-4 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        {[
          { l: 'Patient', v: patient?.name || '—' },
          { l: 'Condition', v: patient?.condition || '—' },
          { l: 'Treatment', v: patient?.treatmentProtocol?.join(', ') || '—' },
          { l: 'Follow-up', v: patient?.nextFollowUp || '—' },
          { l: 'Patient App', v: '⏳ Awaiting activation' },
        ].map(row => (
          <div key={row.l} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-[12px]" style={{ color: 'var(--t3)' }}>{row.l}</span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--t2)' }}>{row.v}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onAddAnother}
          className="flex-1 py-3 rounded-xl text-[13px] font-semibold border transition-all"
          style={{ background: 'transparent', borderColor: 'var(--stroke)', color: 'var(--t2)' }}
        >
          + Add Another
        </button>
        <button
          onClick={onDashboard}
          className="flex-[2] py-3 rounded-xl text-[13px] font-bold"
          style={{ background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', color: '#06181a' }}
        >
          Dashboard →
        </button>
      </div>
    </div>
  );
}

export default function AddPatientScreen() {
  const { addPatientLocal, setActiveNav, refetchPatients } = useApp();
  const [step, setStep] = useState('upload'); // upload | form | success
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleRegister(form) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Call the backend — field names must match CreatePatientRequest in app/schemas.py
      const newPatient = await PatientsAPI.create({
        name: form.name,
        phone: form.phone,
        age: parseInt(form.age) || 0,
        gender: form.gender,
        blood_group: form.bloodGroup,
        admission_date: form.admissionDate,
        condition: form.condition,
        treatment_protocol: form.treatmentProtocol,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        medications: form.medications,
        precautions: form.precautions,
        tests: form.tests,
        next_follow_up: form.nextFollowUp || null,
        total_days: 14,
        vitals: [
          form.pulse && { label: 'Pulse', value: form.pulse, tone: 'good' },
          form.bp && { label: 'BP', value: form.bp, tone: 'good' },
          form.spo2 && { label: 'SPO2', value: form.spo2, tone: 'good' },
          form.weight && { label: 'Weight', value: form.weight, tone: 'neutral' },
        ].filter(Boolean),
        dos: form.dos.split('\n').filter(Boolean),
        donts: form.donts.split('\n').filter(Boolean),
      });

      // Add to local list immediately so it shows up without a full refetch
      addPatientLocal(newPatient);

      setRegisteredPatient({
        ...newPatient,
        condition: form.condition,
        nextFollowUp: form.nextFollowUp,
        treatmentProtocol: form.treatmentProtocol,
      });
      setStep('success');
    } catch (err) {
      setSubmitError(err.message || 'Failed to register patient. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') return (
    <SuccessScreen
      patient={registeredPatient}
      onAddAnother={() => setStep('upload')}
      onDashboard={() => { refetchPatients(); setActiveNav('home'); }}
    />
  );

  if (step === 'form') return (
    <>
      <PatientForm onRegister={handleRegister} />
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(7,12,24,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl border px-6 py-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--teal)' }}>Registering patient…</p>
          </div>
        </div>
      )}
      {submitError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-50">
          <div className="rounded-xl border p-3" style={{ background: 'rgba(255,77,109,0.12)', borderColor: 'rgba(255,77,109,0.3)' }}>
            <p className="text-[12px] font-medium" style={{ color: 'var(--red)' }}>{submitError}</p>
          </div>
        </div>
      )}
    </>
  );

  return <UploadStep onContinue={() => setStep('form')} />;
}
