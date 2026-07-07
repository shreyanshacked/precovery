import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, AdherenceRing, StatusBadge, ActionListItem, CTAButton, Tag } from '../components/UI';
import { STATUS_CONFIG, ADHERENCE_STATUS_COLOR } from '../data/mockData';
import { PatientsAPI } from '../services/api';

function BackHeader({ patient, onBack }) {
  const cfg = STATUS_CONFIG[patient.status];
  return (
    <div className="flex items-center gap-3 py-4">
      <button onClick={onBack}
        className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div className="flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Patient Record</div>
        <div className="text-[16px] font-bold text-[var(--t1)] mt-0.5">{patient.name}</div>
      </div>
      <StatusBadge status={patient.status} />
    </div>
  );
}

function HeroCard({ patient }) {
  const cfg = STATUS_CONFIG[patient.status];
  return (
    <div className="rounded-[20px] border p-[18px] mb-3.5 relative overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg,transparent,rgba(45,212,191,0.03) 50%,transparent)',
        animation: 'scanLine 5s linear infinite'
      }} />
      <div className="flex items-center gap-4">
        <div className="relative w-[84px] h-[84px] flex-shrink-0">
          <AdherenceRing pct={patient.adherence} color={cfg.color} size={84} stroke={5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar patient={patient} size={68} />
          </div>
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-[var(--t1)]">{patient.name}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--t3)' }}>{patient.procedure}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Tag>{patient.phase}</Tag>
            <Tag>Day {patient.day}</Tag>
            <Tag color={cfg.color}>{patient.adherence}% adh.</Tag>
            <Tag>{patient.age} yrs · {patient.gender}</Tag>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {patient.alertMessage && (
        <div className="mt-4 p-3 rounded-xl flex gap-3" style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}30` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}20`, color: cfg.color }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[1px] mb-1" style={{ color: cfg.color }}>{patient.severity} — AI Alert</div>
            <div className="text-[12px] leading-[1.55] text-[var(--t2)]">{patient.alertMessage}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-0 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {[
          { l: 'Blood Group', v: patient.bloodGroup },
          { l: 'Last Visit', v: patient.lastVisit },
          { l: 'Next Follow-up', v: patient.nextFollowUp?.split(' ').slice(0, 2).join(' ') || '—' },
        ].map(m => (
          <div key={m.l}>
            <p className="text-[9px] uppercase tracking-[1px] mb-1" style={{ color: 'var(--t3)' }}>{m.l}</p>
            <p className="text-[12px] font-semibold mono" style={{ color: 'var(--t2)' }}>{m.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdherenceBreakdown({ breakdown }) {
  return (
    <div className="rounded-[18px] border p-4 mb-3.5" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-3" style={{ color: 'var(--t3)' }}>Adherence Breakdown</div>
      <div className="flex flex-col gap-3">
        {breakdown.map(row => {
          const color = ADHERENCE_STATUS_COLOR[row.status] || '#60a5fa';
          return (
            <div key={row.metric} className="flex items-center gap-3">
              <div className="text-[12px] font-medium w-[90px] flex-shrink-0 text-[var(--t2)]">{row.metric}</div>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--stroke)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.progress}%`, background: color }} />
              </div>
              <div className="text-[11px] font-bold mono w-8 text-right" style={{ color }}>{row.progress}%</div>
              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-md w-14 text-center flex-shrink-0"
                style={{ background: `${color}20`, color }}>
                {row.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckInSection({ patient }) {
  const [selectedDay, setSelectedDay] = useState(patient.day - 1);
  const checkIn = patient.checkIns[selectedDay];

  const cfg = STATUS_CONFIG[patient.status];

  return (
    <div className="mb-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-3" style={{ color: 'var(--t3)' }}>Check-in Progress</div>

      {/* Day grid */}
      <div className="rounded-[18px] border p-4 mb-3" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-[var(--t1)]">Day {selectedDay + 1} — {checkIn?.date || 'TBD'}</span>
          <span className="text-[10px] mono" style={{ color: 'var(--t3)' }}>
            {patient.checkIns.filter(c => c.completed).length} / {patient.totalDays} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-3" style={{ background: 'var(--stroke)' }}>
          <div className="h-full rounded-full" style={{
            width: `${(patient.checkIns.filter(c => c.completed).length / patient.totalDays) * 100}%`,
            background: 'var(--teal)'
          }} />
        </div>

        {/* Day pills */}
        <div className="flex gap-2 flex-wrap">
          {patient.checkIns.map((ci, i) => {
            const isSelected = i === selectedDay;
            let bg, color, border;
            if (isSelected) { bg = 'var(--teal)'; color = '#06181a'; border = 'var(--teal)'; }
            else if (ci.missed) { bg = 'rgba(255,77,109,0.15)'; color = 'var(--red)'; border = 'rgba(255,77,109,0.3)'; }
            else if (ci.isToday) { bg = 'rgba(255,184,77,0.15)'; color = 'var(--amber)'; border = 'rgba(255,184,77,0.3)'; }
            else if (ci.completed) { bg = 'rgba(74,222,128,0.12)'; color = 'var(--green)'; border = 'rgba(74,222,128,0.2)'; }
            else { bg = 'var(--card2)'; color = 'var(--t3)'; border = 'var(--stroke)'; }

            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                className="w-7 h-7 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center"
                style={{ background: bg, color, borderColor: border }}>
                {ci.day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {[
            { color: 'var(--green)', label: 'Done' },
            { color: 'var(--amber)', label: 'Today' },
            { color: 'var(--red)', label: 'Missed' },
            { color: 'var(--t3)', label: 'Pending' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis for selected day */}
      {checkIn?.aiAnalysis ? (
        <div className="rounded-[18px] border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.2)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'var(--teal)' }}>AI Analysis</span>
            </div>
            {checkIn.aiAnalysis.sentToPatient ? (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--green)' }}>Sent to Patient</span>
            ) : (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,184,77,0.12)', color: 'var(--amber)' }}>Review Before Sending</span>
            )}
          </div>
          <p className="text-[12px] leading-[1.65] text-[var(--t2)]">{checkIn.aiAnalysis.text}</p>

          {/* Image Analysis (Internal Only) */}
          {checkIn.aiAnalysis.imageAnalysis && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Image Analysis</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--purple)' }}>Internal Only</span>
              </div>

              {/* Image placeholders */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Day 0 — Baseline', `Day ${selectedDay + 1} — Today`].map(label => (
                  <div key={label} className="aspect-square rounded-xl border flex flex-col items-center justify-center gap-1.5" style={{ background: 'var(--card2)', borderColor: 'var(--stroke)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-[9px] text-center px-1" style={{ color: 'var(--t3)' }}>{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] leading-[1.6] text-[var(--t2)]">{checkIn.aiAnalysis.imageAnalysis.summary}</p>
            </div>
          )}

          {/* Clinical KPIs */}
          {checkIn.aiAnalysis.clinicalKpis?.length > 0 && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-[var(--t3)]">Clinical KPIs</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--purple)' }}>Internal Only</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {checkIn.aiAnalysis.clinicalKpis.map(kpi => {
                  const color = kpi.severity === 'critical' ? 'var(--red)' : kpi.severity === 'warning' ? 'var(--amber)' : 'var(--green)';
                  return (
                    <div key={kpi.label} className="rounded-xl p-2.5 border text-center"
                      style={{ background: `${color.replace('var(--','').replace(')','')}` === 'red' ? 'rgba(255,77,109,0.1)' : kpi.severity === 'warning' ? 'rgba(255,184,77,0.1)' : 'rgba(74,222,128,0.1)', borderColor: 'transparent' }}>
                      <div className="text-[14px] font-bold mono" style={{ color }}>{kpi.value}</div>
                      <div className="text-[9px] mt-0.5" style={{ color: 'var(--t3)' }}>{kpi.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[18px] border p-4 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <p className="text-[12px]" style={{ color: 'var(--t3)' }}>No data for Day {selectedDay + 1} yet.</p>
        </div>
      )}
    </div>
  );
}

function PatientInfoSection({ patient }) {
  const [tab, setTab] = useState('symptoms');
  const tabs = ['symptoms', 'diagnosis', 'medications', 'precautions', 'tests'];

  const content = {
    symptoms: patient.symptoms,
    diagnosis: patient.diagnosis,
    medications: patient.medications,
    precautions: patient.precautions,
    tests: patient.tests,
  };

  return (
    <div className="rounded-[18px] border p-4 mb-3.5" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-3" style={{ color: 'var(--t3)' }}>Patient Info</div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize border transition-all"
            style={tab === t
              ? { background: 'var(--teal)', color: '#06181a', borderColor: 'var(--teal)' }
              : { background: 'var(--card2)', color: 'var(--t3)', borderColor: 'var(--stroke)' }}>
            {t}
          </button>
        ))}
      </div>
      <p className="text-[12px] leading-[1.65] text-[var(--t2)]">{content[tab] || '—'}</p>

      {/* Dos & Don'ts inline here */}
      {tab === 'precautions' && (patient.dos || patient.donts) && (
        <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[1px] mb-2" style={{ color: 'var(--green)' }}>✅ Dos</div>
            {patient.dos?.map((d, i) => <p key={i} className="text-[11px] leading-[1.5] mb-1 text-[var(--t2)]">• {d}</p>)}
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[1px] mb-2" style={{ color: 'var(--red)' }}>❌ Don'ts</div>
            {patient.donts?.map((d, i) => <p key={i} className="text-[11px] leading-[1.5] mb-1 text-[var(--t2)]">• {d}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

function VitalsSection({ vitals }) {
  if (!vitals?.length) return null;
  return (
    <div className="mb-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-3" style={{ color: 'var(--t3)' }}>Vitals at Admission</div>
      <div className="grid grid-cols-2 gap-2.5">
        {vitals.map(v => (
          <div key={v.label} className="rounded-[14px] border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <div className="text-[9px] uppercase tracking-[1px] mb-1.5" style={{ color: 'var(--t3)' }}>{v.label}</div>
            <div className="text-[16px] font-bold mono" style={{ color: v.tone === 'good' ? 'var(--green)' : v.tone === 'warning' ? 'var(--amber)' : 'var(--t2)' }}>{v.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorActionsSection({ patient }) {
  const { openDrawer } = useApp();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(null);

  async function handleSendUpdate() {
    setSendError(null);
    setSending(true);
    try {
      await PatientsAPI.sendUpdate(patient.id, {});
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } catch (err) {
      setSendError(err.message || 'Failed to send update');
    } finally {
      setSending(false);
    }
  }

  const actions = [
    { type: 'update-ai', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, label: 'Update AI Analysis', sub: 'Edit notes or add doctor override', color: 'var(--teal)' },
    { type: 'change-prescription', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg>, label: 'Change Prescription', sub: 'Update medications, dosage, frequency', color: 'var(--purple)' },
    { type: 'change-checkin', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Change Check-in Schedule', sub: 'Frequency, duration, questions', color: 'var(--blue)' },
    { type: 'update-diagnosis', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: 'Update Diagnosis', sub: 'Revise clinical diagnosis and notes', color: 'var(--amber)' },
    { type: 'update-precautions', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Update Precautions', sub: "Edit patient dos and don'ts", color: 'var(--green)' },
    { type: 'contact-patient', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: 'Contact Patient', sub: 'Call, video, message, AI suggestions', color: 'var(--teal)' },
    { type: 'schedule-appointment', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>, label: 'Schedule Appointment', sub: 'Book next visit or follow-up', color: 'var(--blue)' },
  ];

  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold uppercase tracking-[1.4px] mb-3" style={{ color: 'var(--t3)' }}>Doctor Actions</div>
      <div className="flex flex-col gap-2">
        {actions.map(a => (
          <ActionListItem
            key={a.type}
            icon={a.icon}
            label={a.label}
            sublabel={a.sub}
            color={a.color}
            onClick={() => openDrawer(a.type, patient.id)}
          />
        ))}
      </div>

      {/* Send to patient */}
      <div className="mt-4">
        <button
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold text-[13px] transition-all active:scale-[0.98]"
          style={{ background: sending ? 'var(--card2)' : 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', color: sending ? 'var(--t3)' : '#06181a' }}
          onClick={handleSendUpdate}
          disabled={sending}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {sending ? 'Sending…' : sent ? '✓ Sent to Patient' : 'Send Updates to Patient'}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        {sendError && <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--red)' }}>{sendError}</p>}
        <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--t3)' }}>Push care plan & notes to patient app</p>
      </div>
    </div>
  );
}

export default function PatientDetailScreen() {
  const { selectedPatient, selectedPatientId, detailLoading, detailError, closePatient } = useApp();

  // Loading state — patient was just clicked, fetching from backend
  if (detailLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        {/* Back button still works while loading */}
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={closePatient}
            className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">Patient Record</div>
            <div className="text-[14px] font-bold text-[var(--t1)] mt-0.5">Loading…</div>
          </div>
        </div>
        {/* Skeleton cards */}
        <div className="px-4 flex flex-col gap-3 mt-2">
          {[84, 60, 140, 120].map((h, i) => (
            <div key={i} className="rounded-[18px] border animate-pulse"
              style={{ height: h, background: 'var(--surface)', borderColor: 'var(--stroke)' }} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: 'var(--teal)', animation: `pulseRing 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (detailError) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={closePatient}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="text-[14px] font-bold text-[var(--t1)]">Error</div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-6 gap-4">
          <div className="text-3xl">⚠️</div>
          <p className="text-[14px] font-semibold text-center" style={{ color: 'var(--red)' }}>
            Failed to load patient
          </p>
          <p className="text-[12px] text-center" style={{ color: 'var(--t3)' }}>{detailError}</p>
          <button
            onClick={closePatient}
            className="px-6 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ background: 'var(--surface)', color: 'var(--teal)', border: '1px solid var(--stroke)' }}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // No patient loaded yet
  if (!selectedPatient) return null;

  const p = selectedPatient;

  return (
    <div className="slide-in pb-28 px-4 overflow-y-auto">
      <BackHeader patient={p} onBack={closePatient} />
      <HeroCard patient={p} />
      <AdherenceBreakdown breakdown={p.adherenceBreakdown} />
      <CheckInSection patient={p} />
      <PatientInfoSection patient={p} />
      <VitalsSection vitals={p.vitals} />
      <DoctorActionsSection patient={p} />
    </div>
  );
}
