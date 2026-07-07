import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, AdherenceRing, StatusBadge, Chip } from '../components/UI';
import { STATUS_CONFIG } from '../data/mockData';

export default function PatientsScreen() {
  const { patients, openPatient } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Moderate' },
    { key: 'good', label: 'On Track' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const filtered = patients.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.procedure.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="fade-up pb-28 px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--t1)]">Patients</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--t3)' }}>{patients.length} assigned to you</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border px-3.5 py-3 mb-3" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search patients…"
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--t1)] placeholder:text-[var(--t3)]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        {FILTERS.map(f => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
        ))}
      </div>

      {/* Patient cards */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">👤</div>
            <p className="text-[14px] font-semibold text-[var(--t2)]">No patients found</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--t3)' }}>Try adjusting your search or filter</p>
          </div>
        ) : filtered.map(p => {
          const cfg = STATUS_CONFIG[p.status];
          return (
            <button
              key={p.id}
              onClick={() => openPatient(p.id, 'patients')}
              className="w-full text-left rounded-[18px] border p-4 transition-transform active:scale-[0.98] cursor-pointer"
              style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <AdherenceRing pct={p.adherence} color={cfg.color} size={48} stroke={3} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar patient={p} size={38} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-bold text-[var(--t1)] truncate">{p.name}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-[11px] truncate" style={{ color: 'var(--t3)' }}>{p.procedure} · {p.condition}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] mono font-semibold" style={{ color: cfg.color }}>{p.adherence}% adherence</span>
                    <span className="text-[10px]" style={{ color: 'var(--t3)' }}>Day {p.day}/{p.totalDays}</span>
                    <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{p.phase}</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>

              {p.alertMessage && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[11px] leading-[1.5]" style={{ color: cfg.color }}>
                    ⚠ {p.alertMessage.slice(0, 100)}{p.alertMessage.length > 100 ? '…' : ''}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
