import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientsAPI } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children, doctor }) {
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState(null);

  // Full detail of the currently open patient — fetched fresh from DB on every open
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const loadPatients = useCallback(() => {
    setPatientsLoading(true);
    return PatientsAPI.list()
      .then(setPatients)
      .catch(err => setPatientsError(err.message))
      .finally(() => setPatientsLoading(false));
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  function refetchPatients() { return loadPatients(); }

  // Re-fetches one patient's full detail and updates both the list and the open detail
  async function refetchPatient(patientId) {
    try {
      const fresh = await PatientsAPI.get(patientId);
      // Update in the patients list (summary fields)
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...fresh } : p));
      // Update the open detail view with the full fresh record
      setSelectedPatientDetail(fresh);
      return fresh;
    } catch (err) {
      console.error('refetchPatient failed:', err.message);
    }
  }

  const [activeNav, setActiveNav] = useState('home');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetailOrigin, setPatientDetailOrigin] = useState('home');
  const [drawer, setDrawer] = useState(null);

  // openPatient: sets nav + immediately fetches full detail from backend
  function openPatient(id, origin = 'home') {
    setSelectedPatientId(id);
    setPatientDetailOrigin(origin);
    setActiveNav('patient-detail');
    setDetailError(null);
    setDetailLoading(true);
    setSelectedPatientDetail(null); // clear previous patient while loading

    PatientsAPI.get(id)
      .then(full => {
        setSelectedPatientDetail(full);
      })
      .catch(err => {
        setDetailError(err.message || 'Failed to load patient');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }

  function closePatient() {
    setSelectedPatientId(null);
    setSelectedPatientDetail(null);
    setDetailError(null);
    setActiveNav(patientDetailOrigin === 'patients' ? 'patients' : 'home');
  }

  function openDrawer(type, patientId) { setDrawer({ type, patientId }); }
  function closeDrawer() { setDrawer(null); }

  function updatePatient(id, updates) {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  function addPatientLocal(newPatient) {
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }

  // selectedPatient: full detail if loaded, otherwise summary from list as fallback
  const selectedPatient =
    selectedPatientDetail ||
    patients.find(p => p.id === selectedPatientId) ||
    null;

  return (
    <AppContext.Provider value={{
      doctor,
      patients,
      patientsLoading,
      patientsError,
      refetchPatients,
      refetchPatient,
      selectedPatient,
      selectedPatientId,
      detailLoading,
      detailError,
      activeNav,
      setActiveNav,
      drawer,
      openPatient,
      closePatient,
      openDrawer,
      closeDrawer,
      updatePatient,
      addPatientLocal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
