import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import DrawerManager from './components/DrawerManager';
import HomeScreen from './pages/HomeScreen';
import PatientDetailScreen from './pages/PatientDetailScreen';
import PatientsScreen from './pages/PatientsScreen';
import AddPatientScreen from './pages/AddPatientScreen';
import SettingsScreen from './pages/SettingsScreen';
import AlertsScreen from './pages/AlertsScreen';
import LoginScreen from './pages/LoginScreen';

function LoadingDots() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg"
          style={{ background: 'linear-gradient(135deg,var(--teal),#0ea5e9)', color: '#06181a' }}
        >
          P+
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: 'var(--teal)', animation: `pulseRing 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { activeNav, patientsLoading, patientsError } = useApp();

  if (patientsLoading) return <LoadingDots />;

  if (patientsError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-[14px] font-semibold mb-2" style={{ color: 'var(--red)' }}>Couldn't load patients</p>
          <p className="text-[12px]" style={{ color: 'var(--t3)' }}>{patientsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div style={{ display: activeNav === 'home' ? 'block' : 'none' }}>
        <HomeScreen />
      </div>
      <div style={{ display: activeNav === 'patient-detail' ? 'block' : 'none' }}>
        <PatientDetailScreen />
      </div>
      <div style={{ display: activeNav === 'patients' ? 'block' : 'none' }}>
        <PatientsScreen />
      </div>
      <div style={{ display: activeNav === 'alerts' ? 'block' : 'none' }}>
        <AlertsScreen />
      </div>
      <div style={{ display: activeNav === 'add-patient' ? 'block' : 'none' }}>
        <AddPatientScreen />
      </div>
      <div style={{ display: activeNav === 'settings' ? 'block' : 'none' }}>
        <SettingsScreen />
      </div>
      <BottomNav />
      <DrawerManager />
    </div>
  );
}

function AuthGate() {
  const { isAuthenticated, loading, doctor } = useAuth();
  if (loading) return <LoadingDots />;
  if (!isAuthenticated) return <LoginScreen />;
  return (
    <AppProvider doctor={doctor}>
      <AppContent />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
