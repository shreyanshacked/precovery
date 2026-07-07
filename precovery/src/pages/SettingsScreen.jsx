import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DoctorsAPI, PatientsAPI } from '../services/api';

function SectionHeader({ title }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-2 px-1" style={{ color: 'var(--t3)' }}>
      {title}
    </div>
  );
}

function SettingsRow({ icon, label, value, onClick, danger = false, toggle = false, toggled = false, onToggle }) {
  return (
    <button
      onClick={onClick || onToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 text-left transition-all active:bg-[var(--card2)]"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--card2)' }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color: danger ? 'var(--red)' : 'var(--t1)' }}>{label}</div>
        {value && <div className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{value}</div>}
      </div>
      {toggle ? (
        <div className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
          style={{ background: toggled ? 'var(--teal)' : 'var(--stroke)' }}>
          <div className="absolute top-1 transition-all rounded-full bg-white w-4 h-4"
            style={{ left: toggled ? '24px' : '4px' }} />
        </div>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={danger ? 'var(--red)' : 'var(--t3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  );
}

function SettingsCard({ children }) {
  return (
    <div className="rounded-2xl border overflow-hidden mb-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
      {children}
    </div>
  );
}

// ── Add Doctor Modal ──────────────────────────────────────────────────────────
function AddDoctorModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: 'Dermatologist', clinic: 'PRECOVERY Clinic',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const specialties = ['Dermatologist', 'Trichologist', 'Aesthetic Surgeon', 'General Physician', 'Cosmetologist'];

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required'); return;
    }
    setError(null); setSaving(true);
    try {
      const newDoctor = await DoctorsAPI.create(form);
      onAdded(newDoctor);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create doctor');
    } finally { setSaving(false); }
  }

  const inputClass = "w-full bg-[var(--card2)] border border-[var(--stroke)] rounded-xl px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors placeholder:text-[var(--t3)]";

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-[420px] mx-auto rounded-t-3xl border-t border-x slide-up overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', maxHeight: '90vh' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--stroke)' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--stroke)' }}>
          <h3 className="text-[15px] font-bold text-[var(--t1)]">Add New Doctor</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[var(--stroke)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Full Name *</label>
            <input className={inputClass} placeholder="Dr. First Last" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Email *</label>
            <input className={inputClass} type="email" placeholder="doctor@precovery.ai" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Password *</label>
            <input className={inputClass} type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Specialty</label>
            <select className={inputClass} value={form.specialty} onChange={e => set('specialty', e.target.value)}>
              {specialties.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Clinic</label>
            <input className={inputClass} placeholder="Clinic name" value={form.clinic} onChange={e => set('clinic', e.target.value)} />
          </div>
          {error && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)' }}>
              <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}
          <button
            onClick={handleSubmit} disabled={saving}
            className="w-full py-3 rounded-xl text-[13px] font-bold mt-1"
            style={{ background: saving ? 'var(--card2)' : 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', color: saving ? 'var(--t3)' : '#06181a' }}>
            {saving ? 'Creating…' : 'Create Doctor Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assign Patient Modal ──────────────────────────────────────────────────────
function AssignPatientModal({ onClose }) {
  const { patients } = useApp();
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    DoctorsAPI.list().then(setDoctors).catch(() => {});
  }, []);

  async function handleAssign() {
    if (!selectedPatient || !selectedDoctor) { setError('Select both a patient and a doctor'); return; }
    setError(null); setSaving(true);
    try {
      const res = await DoctorsAPI.assignPatient(selectedPatient, selectedDoctor);
      setSuccess(res.message || 'Patient reassigned successfully');
      setTimeout(() => { setSuccess(''); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to assign patient');
    } finally { setSaving(false); }
  }

  const selectClass = "w-full bg-[var(--card2)] border border-[var(--stroke)] rounded-xl px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-[420px] mx-auto rounded-t-3xl border-t border-x slide-up overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', maxHeight: '90vh' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--stroke)' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--stroke)' }}>
          <h3 className="text-[15px] font-bold text-[var(--t1)]">Assign Patient to Doctor</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[var(--stroke)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)] block mb-1.5">Select Patient</label>
            <select className={selectClass} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Choose a patient…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.condition}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--t3)] block mb-1.5">Assign to Doctor</label>
            <select className={selectClass} value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">Choose a doctor…</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
              ))}
            </select>
          </div>

          {/* Current assignment info */}
          {selectedPatient && (
            <div className="p-3 rounded-xl" style={{ background: 'var(--card2)' }}>
              {(() => {
                const p = patients.find(x => x.id === selectedPatient);
                return p ? (
                  <p className="text-[12px]" style={{ color: 'var(--t2)' }}>
                    <span style={{ color: 'var(--t3)' }}>Current doctor: </span>
                    {doctors.find(d => d.id === p.doctor_id)?.name || 'Unknown'}
                  </p>
                ) : null;
              })()}
            </div>
          )}

          {error && <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>}
          {success && <p className="text-[12px]" style={{ color: 'var(--green)' }}>✓ {success}</p>}

          <button
            onClick={handleAssign} disabled={saving || !selectedPatient || !selectedDoctor}
            className="w-full py-3 rounded-xl text-[13px] font-bold"
            style={{
              background: (saving || !selectedPatient || !selectedDoctor) ? 'var(--card2)' : 'linear-gradient(135deg,#2dd4bf,#0ea5e9)',
              color: (saving || !selectedPatient || !selectedDoctor) ? 'var(--t3)' : '#06181a',
            }}>
            {saving ? 'Assigning…' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Screen ──────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { doctor } = useApp();
  const { logout } = useAuth();
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifCheckins, setNotifCheckins] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);

  function loadDoctors() {
    if (!doctorsLoaded) {
      DoctorsAPI.list()
        .then(d => { setDoctors(d); setDoctorsLoaded(true); })
        .catch(() => {});
    }
  }

  return (
    <div className="fade-up pb-28 px-4">
      <div className="py-5">
        <h1 className="text-[18px] font-bold text-[var(--t1)]">Settings</h1>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--t3)' }}>App preferences and account</p>
      </div>

      {/* Doctor profile card */}
      <div className="rounded-2xl border p-4 mb-5 flex items-center gap-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,var(--teal),#818cf8)', color: '#06181a' }}>
          {doctor?.initials || '??'}
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-[var(--t1)]">{doctor?.name}</div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--t3)' }}>{doctor?.specialty}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--teal)' }}>{doctor?.clinic}</div>
        </div>
        <div className="text-[9px] font-bold uppercase px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--teal)' }}>
          {doctor?.role}
        </div>
      </div>

      {/* Admin — Doctor Management */}
      <SectionHeader title="Doctor Management" />
      <SettingsCard>
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><line x1="19" y1="8" x2="23" y2="8"/><line x1="21" y1="6" x2="21" y2="10"/></svg>}
          label="Add New Doctor"
          value="Create a doctor account and set credentials"
          onClick={() => setShowAddDoctor(true)}
        />
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>}
          label="Assign Patient to Doctor"
          value="Change which doctor manages a patient"
          onClick={() => setShowAssign(true)}
        />
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="View All Doctors"
          value={doctorsLoaded ? `${doctors.length} doctors registered` : 'Tap to load'}
          onClick={loadDoctors}
        />
      </SettingsCard>

      {/* Doctors list (shown after loaded) */}
      {doctorsLoaded && doctors.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="Registered Doctors" />
          <div className="flex flex-col gap-2">
            {doctors.map(d => (
              <div key={d.id} className="rounded-[14px] border px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--teal),#818cf8)', color: '#06181a' }}>
                  {d.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate text-[var(--t1)]">{d.name}</div>
                  <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--t3)' }}>{d.specialty} · {d.email}</div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--teal)' }}>
                  {d.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <SettingsCard>
        <SettingsRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 3.5-1.5 5-2 6h16c-.5-1-2-2.5-2-6"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
          label="Critical Alerts" toggle toggled={notifAlerts} onToggle={() => setNotifAlerts(p => !p)} />
        <SettingsRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          label="Check-in Reminders" toggle toggled={notifCheckins} onToggle={() => setNotifCheckins(p => !p)} />
        <SettingsRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          label="Patient Messages" toggle toggled={notifMessages} onToggle={() => setNotifMessages(p => !p)} />
      </SettingsCard>

      {/* Account */}
      <SectionHeader title="Account" />
      <SettingsCard>
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="Edit Profile" value="Name, speciality, photo" />
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
          label="Change Password" value="Update your login credentials" />
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Export Patient Data" value="CSV or PDF report" />
      </SettingsCard>

      {/* Logout */}
      <SectionHeader title="Session" />
      <SettingsCard>
        <SettingsRow
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
          label="Log Out" danger onClick={logout} />
      </SettingsCard>

      {/* Modals */}
      {showAddDoctor && (
        <AddDoctorModal
          onClose={() => setShowAddDoctor(false)}
          onAdded={d => setDoctors(p => [...p, d])}
        />
      )}
      {showAssign && (
        <AssignPatientModal onClose={() => setShowAssign(false)} />
      )}
    </div>
  );
}
