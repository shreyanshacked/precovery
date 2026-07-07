import { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI, TokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount — verify stored token
  useEffect(() => {
    const token = TokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate token by fetching /auth/me
    AuthAPI.me()
      .then(setDoctor)
      .catch(() => {
        TokenStore.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    setError(null);
    try {
      const res = await AuthAPI.login(email, password);
      TokenStore.set(res.access_token);
      setDoctor(res.doctor);
      return res.doctor;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch (_) {}
    TokenStore.clear();
    setDoctor(null);
  }

  return (
    <AuthContext.Provider value={{ doctor, loading, error, login, logout, isAuthenticated: !!doctor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
