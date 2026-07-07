import { STATUS_CONFIG } from '../data/mockData';

/** ─── Avatar ─── */
export function Avatar({ patient, size = 42, className = '' }) {
  const colors = ['#2dd4bf', '#60a5fa', '#a78bfa', '#ffb84d', '#4ade80', '#ff4d6d'];
  const colorIdx = (patient?.name?.charCodeAt(0) || 0) % colors.length;
  const bg = colors[colorIdx];

  if (patient?.avatarUrl) {
    return (
      <img
        src={patient.avatarUrl}
        alt={patient.name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const fontSize = size > 50 ? 18 : size > 30 ? 13 : 10;
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: bg, fontSize, color: '#06181a' }}
    >
      {patient?.initials || '?'}
    </div>
  );
}

/** ─── Adherence Ring (SVG) ─── */
export function AdherenceRing({ pct = 0, color = '#2dd4bf', size = 58, stroke = 3.5 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/** ─── Status Badge ─── */
export function StatusBadge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.good;
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-[0.6px] px-2 py-1 rounded-full flex-shrink-0 ${className}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

/** ─── Section Header ─── */
export function SectionHeader({ icon, title, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.4px]" style={{ color: 'var(--t3)' }}>
        {icon}
        {title}
      </div>
      {right}
    </div>
  );
}

/** ─── Card ─── */
export function Card({ children, className = '', onClick, style }) {
  const base = 'rounded-[18px] border p-[14px]';
  const colors = 'border-[var(--stroke)] bg-[var(--surface)]';
  const interactive = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : '';
  return (
    <div className={`${base} ${colors} ${interactive} ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

/** ─── Progress Bar ─── */
export function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 rounded-full flex-1" style={{ background: 'var(--stroke)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

/** ─── Chip Button ─── */
export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150"
      style={
        active
          ? { background: 'var(--teal)', color: '#06181a', borderColor: 'var(--teal)' }
          : { background: 'var(--card2)', color: 'var(--t3)', borderColor: 'var(--stroke)' }
      }
    >
      {children}
    </button>
  );
}

/** ─── Input Field ─── */
export function Input({ label, value, onChange, placeholder, type = 'text', multiline = false, className = '' }) {
  const inputClass = `w-full bg-[var(--card2)] border border-[var(--stroke)] rounded-xl px-3 py-2.5 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--teal)] transition-colors placeholder:text-[var(--t3)] ${className}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--t3)]">{label}</label>}
      {multiline
        ? <textarea rows={3} className={inputClass} value={value} onChange={onChange} placeholder={placeholder} />
        : <input type={type} className={inputClass} value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  );
}

/** ─── Action Button (list style) ─── */
export function ActionListItem({ icon, label, sublabel, onClick, color = 'var(--teal)' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--stroke)] bg-[var(--card)] active:scale-[0.98] transition-transform text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[var(--t1)]">{label}</div>
        {sublabel && <div className="text-[11px] text-[var(--t3)] mt-0.5">{sublabel}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/** ─── Teal CTA Button ─── */
export function CTAButton({ children, onClick, className = '', variant = 'primary', disabled = false }) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] text-[#06181a] font-bold',
    ghost: 'border border-[var(--stroke)] text-[var(--t2)] bg-transparent',
    danger: 'bg-[rgba(255,77,109,0.15)] border border-[rgba(255,77,109,0.3)] text-[var(--red)]',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98] ${variants[variant]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

/** ─── Tag ─── */
export function Tag({ children, color }) {
  return (
    <span
      className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md"
      style={color ? { background: `${color}1a`, color } : { background: 'var(--card2)', color: 'var(--t2)' }}
    >
      {children}
    </span>
  );
}
