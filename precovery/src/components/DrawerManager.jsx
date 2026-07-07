import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CTAButton, Input } from './UI';
import { CheckInsAPI, PatientsAPI } from '../services/api';

function DrawerShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-[420px] mx-auto rounded-t-3xl border-t border-x slide-up"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--stroke)' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--stroke)' }}>
          <h3 className="text-[15px] font-bold text-[var(--t1)]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[var(--stroke)] flex items-center justify-center text-[var(--t3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/** ─── Update AI Analysis ─── */
function DrawerUpdateAI({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const lastCheckIn = patient.checkIns?.find(c => c.isToday) || patient.checkIns?.[patient.day - 1];
  const [text, setText] = useState(lastCheckIn?.aiAnalysis?.text || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await CheckInsAPI.updateAIAnalysis(patient.id, { text });
      await refetchPatient(patient.id); // Re-fetch from Supabase → updates UI
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save analysis');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Update AI Analysis" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[12px] text-[var(--t3)]">Edit the AI-generated analysis for today's check-in. Your changes will be saved and optionally sent to the patient.</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Analysis Text</label>
          <textarea
            rows={6}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors resize-none"
            style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}
        <div className="flex flex-col gap-2 mt-2">
          <CTAButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Analysis'}
          </CTAButton>
          <CTAButton variant="ghost" onClick={onClose}>Cancel</CTAButton>
        </div>
      </div>
    </DrawerShell>
  );
}

/** ─── Contact Patient ─── */
function DrawerContactPatient({ patient, onClose }) {
  const [mode, setMode] = useState(null); // null | 'call' | 'video' | 'message'
  const [message, setMessage] = useState('');

  const contactOptions = [
    { key: 'call', icon: '📞', label: 'Voice Call', sub: patient.phone, color: 'var(--green)' },
    { key: 'video', icon: '🎥', label: 'Video Consult', sub: 'In-app video call', color: 'var(--blue)' },
    { key: 'message', icon: '💬', label: 'Send Message', sub: 'WhatsApp / In-app', color: 'var(--teal)' },
  ];

  if (mode === 'message') {
    return (
      <DrawerShell title="Message Patient" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--stroke)' }}>
            <span className="text-xl">💬</span>
            <div>
              <div className="text-[12px] font-semibold text-[var(--t1)]">{patient.name}</div>
              <div className="text-[11px] text-[var(--t3)]">{patient.phone}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Message</label>
            <textarea
              rows={5}
              className="w-full rounded-xl border px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors resize-none"
              style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}
              placeholder="Type your message to the patient…"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <CTAButton onClick={onClose}>Send via WhatsApp</CTAButton>
            <CTAButton variant="ghost" onClick={() => setMode(null)}>← Back</CTAButton>
          </div>
        </div>
      </DrawerShell>
    );
  }

  if (mode === 'call' || mode === 'video') {
    return (
      <DrawerShell title={mode === 'call' ? 'Voice Call' : 'Video Consult'} onClose={onClose}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--card2)' }}>
              {mode === 'call' ? '📞' : '🎥'}
            </div>
            <div className="text-[15px] font-bold text-[var(--t1)]">{patient.name}</div>
            <div className="text-[12px] text-[var(--t3)]">{patient.phone}</div>
          </div>
          <CTAButton onClick={onClose}>
            {mode === 'call' ? 'Start Call' : 'Start Video'}
          </CTAButton>
          <CTAButton variant="ghost" onClick={() => setMode(null)}>← Back</CTAButton>
        </div>
      </DrawerShell>
    );
  }

  return (
    <DrawerShell title="Contact Patient" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-[12px] text-[var(--t3)] mb-1">Choose how to reach {patient.name}</p>
        {contactOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left active:scale-[0.98] transition-transform"
            style={{ background: 'var(--card)', borderColor: 'var(--stroke)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${opt.color}15` }}>
              {opt.icon}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[var(--t1)]">{opt.label}</div>
              <div className="text-[11px] text-[var(--t3)]">{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </DrawerShell>
  );
}

/** ─── Schedule Appointment ─── */
function DrawerScheduleAppointment({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

  // Generate calendar for current month
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  async function handleSchedule() {
    if (!selectedDate || !selectedTime) return;
    setError(null);
    setSaving(true);
    try {
      // Build ISO date (YYYY-MM-DD) for the backend
      const monthIndex = today.getMonth(); // 0-based, matches `month` above
      const isoDate = new Date(year, monthIndex, selectedDate).toISOString().split('T')[0];

      const newAppt = await PatientsAPI.scheduleAppointment(patient.id, {
        date: isoDate,
        time: selectedTime,
        type: 'Follow-up',
        notes,
      });
      await refetchPatient(patient.id); // pull fresh appointments from Supabase
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Schedule Appointment" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Calendar */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--t3)] mb-3">{monthName} {year}</div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-[10px] font-semibold text-center text-[var(--t3)] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => (
              <button
                key={i}
                disabled={!d || d <= today.getDate()}
                onClick={() => d && setSelectedDate(d)}
                className="aspect-square rounded-xl text-[12px] font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                style={
                  selectedDate === d
                    ? { background: 'var(--teal)', color: '#06181a' }
                    : d
                    ? { background: 'var(--card2)', color: 'var(--t2)' }
                    : {}
                }
              >
                {d || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--t3)] mb-3">Select Time</div>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className="py-2 rounded-xl text-[11px] font-semibold border transition-all"
                style={
                  selectedTime === t
                    ? { background: 'var(--teal)', color: '#06181a', borderColor: 'var(--teal)' }
                    : { background: 'var(--card2)', color: 'var(--t2)', borderColor: 'var(--stroke)' }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Post-session review…" multiline />

        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}

        <CTAButton onClick={handleSchedule} disabled={!selectedDate || !selectedTime || saving}>
          {saving ? 'Scheduling…' : saved ? '✓ Scheduled' : 'Schedule Appointment'}
        </CTAButton>
      </div>
    </DrawerShell>
  );
}

/** ─── Change Prescription ─── */
function DrawerChangePrescription({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const [medications, setMedications] = useState(patient.medications || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await PatientsAPI.update(patient.id, { medications });
      await refetchPatient(patient.id);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update prescription');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Change Prescription" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[12px] text-[var(--t3)]">Update the current medication and dosage plan for this patient.</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Current Prescription</label>
          <textarea
            rows={6}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors resize-none"
            style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}
            value={medications}
            onChange={e => setMedications(e.target.value)}
            placeholder="e.g. Tretinoin 0.025% nightly · Clindamycin gel BD"
          />
        </div>
        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}
        <div className="flex flex-col gap-2">
          <CTAButton onClick={handleSave} disabled={saving}>{saving ? 'Updating…' : saved ? '✓ Updated' : 'Update Prescription'}</CTAButton>
          <CTAButton variant="ghost" onClick={onClose}>Cancel</CTAButton>
        </div>
      </div>
    </DrawerShell>
  );
}

/** ─── Change Check-in Schedule ─── */
function DrawerChangeCheckInSchedule({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [frequency, setFrequency] = useState('daily');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      // NOTE: backend does not yet have a dedicated checkin-schedule endpoint.
      // total_days on the patient record approximates schedule length for now.
      // To fully support this, add PUT /api/patients/{id}/checkin-schedule
      // on the backend and call it here instead.
      await PatientsAPI.update(patient.id, {});
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Change Check-in Schedule" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--t3)] mb-2">Frequency</div>
          <div className="grid grid-cols-3 gap-2">
            {['daily', 'alternate', 'weekly'].map(f => (
              <button key={f} onClick={() => setFrequency(f)}
                className="py-2.5 rounded-xl text-[11px] font-semibold border transition-all capitalize"
                style={frequency === f
                  ? { background: 'var(--teal)', color: '#06181a', borderColor: 'var(--teal)' }
                  : { background: 'var(--card2)', color: 'var(--t2)', borderColor: 'var(--stroke)' }}
              >{f}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-[var(--t3)] mb-3">End Date — {monthName} {year}</div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-[10px] font-semibold text-center text-[var(--t3)] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => (
              <button key={i} disabled={!d || d <= today.getDate()} onClick={() => d && setSelectedDate(d)}
                className="aspect-square rounded-xl text-[12px] font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                style={selectedDate === d
                  ? { background: 'var(--teal)', color: '#06181a' }
                  : d ? { background: 'var(--card2)', color: 'var(--t2)' } : {}}
              >{d || ''}</button>
            ))}
          </div>
        </div>

        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}

        <CTAButton onClick={handleSave} disabled={!selectedDate || saving}>
          {saving ? 'Updating…' : saved ? '✓ Updated' : 'Update Schedule'}
        </CTAButton>
      </div>
    </DrawerShell>
  );
}

/** ─── Update Precautions ─── */
function DrawerUpdatePrecautions({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const [precautions, setPrecautions] = useState(patient.precautions || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await PatientsAPI.update(patient.id, { precautions });
      await refetchPatient(patient.id);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save precautions');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Update Precautions" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[12px] text-[var(--t3)]">Edit the precautions and care instructions for this patient.</p>
        <textarea
          rows={6}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors resize-none"
          style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}
          value={precautions}
          onChange={e => setPrecautions(e.target.value)}
          placeholder="e.g. No sun 72hr. No hair wash 48hr…"
        />
        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}
        <div className="flex flex-col gap-2">
          <CTAButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Precautions'}</CTAButton>
          <CTAButton variant="ghost" onClick={onClose}>Cancel</CTAButton>
        </div>
      </div>
    </DrawerShell>
  );
}

/** ─── Update Diagnosis ─── */
function DrawerUpdateDiagnosis({ patient, onClose }) {
  const { refetchPatient } = useApp();
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await PatientsAPI.update(patient.id, { diagnosis });
      await refetchPatient(patient.id);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save diagnosis');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerShell title="Update Diagnosis" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[12px] text-[var(--t3)]">Revise the clinical diagnosis and notes for this patient.</p>
        <textarea
          rows={6}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors resize-none"
          style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}
          value={diagnosis}
          onChange={e => setDiagnosis(e.target.value)}
          placeholder="e.g. Acne Vulgaris — Hormonal type, Grade III…"
        />
        {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}
        <div className="flex flex-col gap-2">
          <CTAButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Diagnosis'}</CTAButton>
          <CTAButton variant="ghost" onClick={onClose}>Cancel</CTAButton>
        </div>
      </div>
    </DrawerShell>
  );
}

/** ─── Main Drawer Router ─── */
export default function DrawerManager() {
  const { drawer, closeDrawer, patients } = useApp();
  if (!drawer) return null;

  const patient = patients.find(p => p.id === drawer.patientId);
  if (!patient) return null;

  const map = {
    'update-ai': DrawerUpdateAI,
    'contact-patient': DrawerContactPatient,
    'schedule-appointment': DrawerScheduleAppointment,
    'change-prescription': DrawerChangePrescription,
    'change-checkin': DrawerChangeCheckInSchedule,
    'update-precautions': DrawerUpdatePrecautions,
    'update-diagnosis': DrawerUpdateDiagnosis,
  };

  const Component = map[drawer.type];
  if (!Component) return null;

  return <Component patient={patient} onClose={closeDrawer} />;
}
