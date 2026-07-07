import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5L12 4l9 7.5" /><path d="M5 10v10h5v-6h4v6h5V10" />
      </svg>
    ),
  },
  {
    key: 'patients',
    label: 'Patients',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'add-patient',
    label: 'Add Patient',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    highlight: true,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { activeNav, setActiveNav, patients } = useApp();

  // Hide nav on patient detail
  if (activeNav === 'patient-detail') return null;

  const criticalCount = patients.filter(p => p.status === 'critical').length;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] border-t flex items-center justify-around px-2 pb-5 pt-2 z-40"
      style={{ background: 'rgba(7,12,24,0.94)', backdropFilter: 'blur(12px)', borderColor: 'var(--stroke)' }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeNav === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            className="flex flex-col items-center gap-1 flex-1 py-1 border-none bg-transparent cursor-pointer relative"
          >
            {item.highlight ? (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', color: '#06181a' }}
              >
                {item.icon}
              </div>
            ) : (
              <div style={{ color: isActive ? 'var(--teal)' : 'var(--t3)', position: 'relative' }}>
                {item.icon}
                {item.key === 'home' && criticalCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-2 text-[8px] font-bold rounded-full flex items-center justify-center"
                    style={{ width: 14, height: 14, background: 'var(--red)', color: '#fff' }}
                  >
                    {criticalCount}
                  </span>
                )}
              </div>
            )}
            {!item.highlight && (
              <span className="text-[9px] font-semibold" style={{ color: isActive ? 'var(--teal)' : 'var(--t3)' }}>
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
