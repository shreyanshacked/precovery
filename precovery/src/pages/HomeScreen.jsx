import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, AdherenceRing, StatusBadge, Chip, SectionHeader } from '../components/UI';
import { STATUS_CONFIG } from '../data/mockData';

function TopBar() {
  const { doctor } = useApp();
  return (
    <div className="flex items-center justify-between py-5">
      <div className="flex items-center gap-2.5">
        <div
          className="w-[42px] h-[42px] rounded-2xl flex items-center justify-center font-extrabold text-[14px]"
          style={{ background: 'linear-gradient(135deg,var(--teal),#0ea5e9)', color: '#06181a', boxShadow: '0 0 20px -4px var(--teal)' }}
        >
          P+
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-[0.5px] text-[var(--t1)]">PRECOVERY</h1>
          <p className="text-[10px] font-semibold tracking-[1.5px] mt-0.5" style={{ color: 'var(--teal)' }}>AI CARE COMPANION</p>
        </div>
      </div>
      <div className="flex items-center gap-2 border rounded-full px-2.5 py-1" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--stroke)' }}>
        <span className="text-[12px] font-medium text-[var(--t2)]">{doctor.name}</span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: 'linear-gradient(135deg,var(--teal),#818cf8)', color: '#06181a' }}
        >
          {doctor.initials}
        </div>
      </div>
    </div>
  );
}

function StatsRow({ patients }) {
  const registered = patients.length;
  const active = patients.filter(p => p.status !== 'resolved').length;
  const alerts = patients.filter(p => p.status === 'critical').length;

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-6">
      {[
        { label: 'Registered', val: registered, sub: 'Total patients', color: 'var(--blue)', cls: 'var(--blue)' },
        { label: 'Active', val: active, sub: 'In recovery', color: 'var(--teal)', cls: 'var(--teal)' },
        { label: 'Critical', val: alerts, sub: 'Need review', color: 'var(--red)', cls: 'var(--red)' },
      ].map(s => (
        <div key={s.label}
          className="rounded-2xl border p-3.5 relative overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
        >
          <div className="absolute -right-4 -top-4 w-14 h-14 rounded-full opacity-20 blur-2xl" style={{ background: s.color }} />
          <div className="text-[9px] font-bold uppercase tracking-[1.2px] mb-1.5 relative" style={{ color: 'var(--t3)' }}>{s.label}</div>
          <div className="text-[26px] font-bold tracking-[-1px] leading-none relative mono" style={{ color: s.cls }}>{s.val}</div>
          <div className="text-[10px] mt-1 relative" style={{ color: 'var(--t3)' }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function PatientChipRow({ patients, onSelect, filter }) {
  const filtered = patients.filter(p => filter === 'all' || p.status === filter);
  if (!filtered.length) return (
    <div className="text-[12px] py-4" style={{ color: 'var(--t3)' }}>No patients in this category.</div>
  );

  return (
    <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 mb-6">
      {filtered.map(p => {
        const cfg = STATUS_CONFIG[p.status];
        return (
          <button key={p.id} onClick={() => onSelect(p.id)} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[66px] border-none bg-transparent cursor-pointer">
            <div className="relative w-[58px] h-[58px]">
              <AdherenceRing pct={p.adherence} color={cfg.color} size={58} stroke={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar patient={p} size={46} />
              </div>
              {p.status === 'critical' && (
                <span className="pulse-ring absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg)]" style={{ background: 'var(--red)' }} />
              )}
            </div>
            <span className="text-[10px] font-semibold text-center truncate w-full" style={{ color: 'var(--t2)' }}>
              {p.name.split(' ')[0]}
            </span>
            <span className="text-[9px] font-bold mono" style={{ color: cfg.color }}>{p.adherence}%</span>
          </button>
        );
      })}
    </div>
  );
}

function AlertCard({ patient, onSelect }) {
  const cfg = STATUS_CONFIG[patient.status];
  return (
    <button
      onClick={() => onSelect(patient.id)}
      className="w-full text-left rounded-[18px] border p-3.5 transition-transform active:scale-[0.98] cursor-pointer"
      style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', borderLeftWidth: 3, borderLeftColor: cfg.color }}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar patient={patient} size={42} />
          <div>
            <div className="text-[14px] font-bold text-[var(--t1)]">{patient.name}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{patient.procedure} · {patient.phase}</div>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.6px] px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: `${cfg.color}1a`, color: cfg.color }}>{patient.severity}</span>
      </div>
      <p className="text-[12px] leading-[1.55] mb-2.5" style={{ color: 'var(--t2)' }}>
        {patient.alertMessage.length > 120 ? patient.alertMessage.slice(0, 120) + '…' : patient.alertMessage}
      </p>
      <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 text-[11px] font-semibold mono" style={{ color: cfg.color }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {patient.adherence}% adherence
        </div>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--t3)' }}>
          Day {patient.day}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </button>
  );
}

function GoodCard({ patient, onSelect }) {
  const cfg = STATUS_CONFIG[patient.status];
  return (
    <button
      onClick={() => onSelect(patient.id)}
      className="w-full flex items-center gap-3 p-3 rounded-[14px] border text-left transition-transform active:scale-[0.98] cursor-pointer"
      style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
    >
      <Avatar patient={patient} size={38} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold truncate text-[var(--t1)]">{patient.name}</div>
        <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--t3)' }}>{patient.procedure} · {patient.phase}</div>
      </div>
      <div className="relative w-9 h-9 flex-shrink-0">
        <AdherenceRing pct={patient.adherence} color={cfg.color} size={36} stroke={3} />
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mono" style={{ color: cfg.color }}>{patient.adherence}%</div>
      </div>
    </button>
  );
}

export default function HomeScreen() {
  const { patients, openPatient } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const FILTER_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Moderate' },
    { key: 'good', label: 'On Track' },
  ];

  const filteredSearch = search
    ? patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.procedure.toLowerCase().includes(search.toLowerCase()) ||
        p.condition.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const alertPatients = patients.filter(p => p.status === 'critical' || p.status === 'warning');
  const goodPatients = patients.filter(p => p.status === 'good' || p.status === 'resolved');

  return (
    <div className="fade-up pb-28 px-4">
      <TopBar />
      <StatsRow patients={patients} />

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border px-3.5 py-3 mb-3" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name or procedure…"
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--t1)] placeholder:text-[var(--t3)]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-[var(--t3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Search results */}
      {filteredSearch ? (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--t3)' }}>
            {filteredSearch.length} result{filteredSearch.length !== 1 ? 's' : ''} for "{search}"
          </div>
          {filteredSearch.length === 0
            ? <p className="text-[13px] py-4" style={{ color: 'var(--t3)' }}>No patients found.</p>
            : filteredSearch.map(p => (
                p.status === 'critical' || p.status === 'warning'
                  ? <div className="mb-2.5" key={p.id}><AlertCard patient={p} onSelect={openPatient} /></div>
                  : <div className="mb-2" key={p.id}><GoodCard patient={p} onSelect={openPatient} /></div>
              ))
          }
        </div>
      ) : (
        <>
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
            {FILTER_OPTIONS.map(f => (
              <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
            ))}
          </div>

          {/* Patient avatar chips */}
          <SectionHeader
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            title="Select Patient"
            right={<span className="text-[10px] mono" style={{ color: 'var(--t3)' }}>{patients.length} total</span>}
          />
          <PatientChipRow patients={patients} onSelect={openPatient} filter={filter} />

          {/* Alerts */}
          {alertPatients.length > 0 && (
            <div className="mb-5">
              <SectionHeader
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 3.5-1.5 5-2 6h16c-.5-1-2-2.5-2-6M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                title="Alerts"
                right={<span className="text-[9px] font-bold uppercase tracking-[0.8px] px-2 py-1 rounded-full" style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--red)' }}>{alertPatients.length} ACTIVE</span>}
              />
              <div className="flex flex-col gap-2.5">
                {alertPatients.map(p => <AlertCard key={p.id} patient={p} onSelect={openPatient} />)}
              </div>
            </div>
          )}

          {/* Good patients */}
          {goodPatients.length > 0 && (
            <div>
              <SectionHeader
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                title="Recovering Well"
              />
              <div className="flex flex-col gap-2">
                {goodPatients.map(p => <GoodCard key={p.id} patient={p} onSelect={openPatient} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
