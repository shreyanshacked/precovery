import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayError = localError || authError;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl mb-4"
            style={{ background: 'linear-gradient(135deg,var(--teal),#0ea5e9)', color: '#06181a', boxShadow: '0 0 40px -8px var(--teal)' }}
          >
            P+
          </div>
          <h1 className="text-[24px] font-bold tracking-[0.5px] text-[var(--t1)]">PRECOVERY</h1>
          <p className="text-[11px] font-semibold tracking-[2px] mt-1" style={{ color: 'var(--teal)' }}>AI CARE COMPANION</p>
          <p className="text-[12px] mt-2" style={{ color: 'var(--t3)' }}>Doctor Portal — Secure Login</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
        >
          <h2 className="text-[16px] font-bold text-[var(--t1)] mb-1">Welcome back</h2>
          <p className="text-[12px] mb-6" style={{ color: 'var(--t3)' }}>Sign in with your clinic credentials</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--t3)]">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@precovery.ai"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-3 rounded-xl border text-[13px] outline-none transition-colors"
                  style={{
                    background: 'var(--card2)',
                    borderColor: email ? 'var(--teal)' : 'var(--stroke)',
                    color: 'var(--t1)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--t3)]">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-[13px] outline-none transition-colors"
                  style={{
                    background: 'var(--card2)',
                    borderColor: password ? 'var(--teal)' : 'var(--stroke)',
                    color: 'var(--t1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t3)] hover:text-[var(--t2)]"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-[12px] font-medium" style={{ color: 'var(--red)' }}>{displayError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all mt-1"
              style={{
                background: loading ? 'var(--card2)' : 'linear-gradient(135deg,#2dd4bf,#0ea5e9)',
                color: loading ? 'var(--t3)' : '#06181a',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Demo credentials hint (remove in production) */}
        <div
          className="mt-4 rounded-2xl border p-4"
          style={{ background: 'rgba(45,212,191,0.04)', borderColor: 'rgba(45,212,191,0.15)' }}
        >
          <div className="text-[9px] font-bold uppercase tracking-[1.2px] mb-2.5" style={{ color: 'var(--teal)' }}>Demo Credentials (Dev Only)</div>
          <div className="flex flex-col gap-1.5">
            {[
              { name: 'Dr. Priya Nair', email: 'priya.nair@precovery.ai', patients: 'Meera Kapoor, Arjun Patel' },
              { name: 'Dr. Anil Sharma', email: 'anil.sharma@precovery.ai', patients: 'Priti Soni, Ritika Sharma' },
              { name: 'Dr. Sofia Martinez', email: 'sofia.martinez@precovery.ai', patients: 'Vijay Malhotra, Nisha Kumar' },
            ].map(d => (
              <button
                key={d.email}
                onClick={() => { setEmail(d.email); setPassword('Doctor@123'); }}
                className="text-left p-2 rounded-xl transition-all hover:bg-[var(--card2)] border border-transparent hover:border-[var(--stroke)]"
              >
                <div className="text-[11px] font-semibold text-[var(--t1)]">{d.name}</div>
                <div className="text-[10px] mono mt-0.5" style={{ color: 'var(--t3)' }}>{d.email} · Doctor@123</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Patients: {d.patients}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] mt-5" style={{ color: 'var(--t3)' }}>
          PRECOVERY · All patient data is confidential and access-controlled
        </p>
      </div>
    </div>
  );
}
