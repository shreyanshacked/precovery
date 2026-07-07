import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, AdherenceRing, StatusBadge } from '../components/UI';
import { STATUS_CONFIG } from '../data/mockData';
import { PatientsAPI } from '../services/api';

function AlertCard({ patient, onOpen }) {
  const cfg = STATUS_CONFIG[patient.status];

  return (
    <button
      onClick={() => onOpen(patient.id)}
      className="w-full text-left rounded-[18px] border overflow-hidden transition-transform active:scale-[0.98]"
      style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
    >
      {/* Severity bar */}
      <div className="h-1 w-full" style={{ background: cfg.color }} />

      <div className="p-4">
        {/* Patient identity row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-11 h-11 flex-shrink-0">
            <AdherenceRing pct={patient.adherence} color={cfg.color} size={44} stroke={3} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar patient={patient} size={34} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-[var(--t1)]">{patient.name}</span>
              <StatusBadge status={patient.status} />
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>
              {patient.procedure} · {patient.phase}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] font-bold mono" style={{ color: cfg.color }}>{patient.adherence}%</div>
            <div className="text-[9px]" style={{ color: 'var(--t3)' }}>adherence</div>
          </div>
        </div>

        {/* Alert message */}
        {patient.alertMessage && (
          <div className="flex gap-2.5 p-3 rounded-xl mb-3"
            style={{ background: `${cfg.color}0d`, border: `1px solid ${cfg.color}25` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.color}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[11px] leading-[1.55]" style={{ color: 'var(--t2)' }}>
              {patient.alertMessage}
            </p>
          </div>
        )}

        {/* Key clinical fields grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Condition', value: patient.condition },
            { label: 'Day', value: `Day ${patient.day} / ${patient.totalDays}` },
            { label: 'Severity', value: patient.severity },
          ].map(f => (
            <div key={f.label} className="rounded-xl p-2.5"
              style={{ background: 'var(--card2)' }}>
              <div className="text-[9px] uppercase tracking-[1px] mb-1" style={{ color: 'var(--t3)' }}>{f.label}</div>
              <div className="text-[11px] font-semibold truncate" style={{ color: 'var(--t1)' }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Adherence breakdown mini */}
        {patient.adherenceBreakdown?.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {patient.adherenceBreakdown.map(ab => {
              const barColor = ab.status === 'Critical' ? 'var(--red)'
                : ab.status === 'Low' ? 'var(--amber)' : 'var(--green)';
              return (
                <div key={ab.metric} className="flex items-center gap-2">
                  <span className="text-[10px] w-20 flex-shrink-0" style={{ color: 'var(--t3)' }}>{ab.metric}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--stroke)' }}>
                    <div className="h-full rounded-full" style={{ width: `${ab.progress}%`, background: barColor }} />
                  </div>
                  <span className="text-[10px] font-bold mono w-7 text-right" style={{ color: barColor }}>{ab.progress}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            {patient.nextFollowUp && (
              <div className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span className="text-[10px]" style={{ color: 'var(--t3)' }}>
                  Next: {patient.nextFollowUp}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: cfg.color }}>
            View Record
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function AlertsScreen() {
  const { patients, openPatient, patientsLoading } = useApp();
  const [filter, setFilter] = useState('all'); // all | critical | warning

  const alertPatients = patients.filter(p =>
    p.status === 'critical' || p.status === 'warning'
  );

  const filtered = filter === 'all'
    ? alertPatients
    : alertPatients.filter(p => p.status === filter);

  const criticalCount = alertPatients.filter(p => p.status === 'critical').length;
  const warningCount = alertPatients.filter(p => p.status === 'warning').length;

  return (
    <div className="fade-up pb-28 px-4">
      {/* Header */}
      <div className="py-5">
        <div className="flex items-center gap-2 mb-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 3.5-1.5 5-2 6h16c-.5-1-2-2.5-2-6"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <h1 className="text-[18px] font-bold text-[var(--t1)]">Alerts</h1>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--t3)' }}>
          Patients requiring your attention
        </p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { key: 'all', label: 'All Alerts', count: alertPatients.length, color: 'var(--amber)' },
          { key: 'critical', label: 'Critical', count: criticalCount, color: 'var(--red)' },
          { key: 'warning', label: 'Moderate', count: warningCount, color: 'var(--amber)' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className="rounded-[14px] border p-3 text-left transition-all"
            style={{
              background: filter === s.key ? `${s.color}15` : 'var(--surface)',
              borderColor: filter === s.key ? s.color : 'var(--stroke)',
            }}>
            <div className="text-[22px] font-bold mono" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[9px] uppercase tracking-[1px] mt-0.5" style={{ color: 'var(--t3)' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Alert list */}
      {patientsLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: 'var(--teal)', animation: `pulseRing 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-[15px] font-semibold text-[var(--t1)]">No alerts</p>
          <p className="text-[12px] mt-1.5" style={{ color: 'var(--t3)' }}>
            {filter === 'all' ? 'All your patients are on track' : `No ${filter} alerts right now`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => (
            <AlertCard key={p.id} patient={p} onOpen={openPatient} />
          ))}
        </div>
      )}
    </div>
  );
}
