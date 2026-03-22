import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { mockAmbulances, mockSignals, mockAlerts, mockAnalytics, mockHospitals } from '../mockData';
import { advanceAmbulances } from '../simulation/ambulanceMovement';
import { updateTrafficSignals } from '../simulation/signalAutomation';
import { recalculateMetrics as _recalculateMetrics } from '../simulation/metricsEngine';
import { SimulationContext } from './useSimulation';
import {
  isSupabaseReady,
  getAmbulances,
  getSignals,
  getHospitals,
  getAlerts,
  subscribeToAmbulances,
  subscribeToSignals,
  subscribeToAlerts,
  triggerEmergency as dbTriggerEmergency,
} from '../services/databaseService';

export const SimulationProvider = ({ children }) => {
  const { logAction, verifyVehicle } = useAuth();

  const resetSimulation = () => {
    setAmbulances(mockAmbulances.map(amb => ({ ...amb, routeStep: 0, status: 'Active' })));
    setSignals(mockSignals);
    setAlerts(prev => [{
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: 'Simulation Fleet Reset to initial positions.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'info'
    }, ...prev].slice(0, 8));
    logAction('Simulation Reset Performed');
  };

  const [ambulances, setAmbulances] = useState(() => 
    mockAmbulances.map(amb => ({ ...amb, lastUpdateTime: Date.now(), lastLocation: amb.currentLocation }))
  );
  const [signals, setSignals] = useState(mockSignals);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [analytics, setAnalytics] = useState({
    activeEmergencies: 0,
    signalsControlled: 0,
    averageTimeSaved: '8.5 mins',
    activeCorridors: 0,
    chartData: mockAnalytics.chartData
  });
  const [systemStatus, setSystemStatus] = useState('online'); // online | offline | maintenance
  const [focusedAmbulanceId, setFocusedAmbulanceId] = useState(null);
  const [trafficLoad, setTrafficLoad] = useState('Medium'); // Low | Medium | High
  const [manualOverrides, setManualOverrides] = useState({}); // { signalId: { status, expiry } }

  // Refs must be declared before they're used in effects
  const manualOverridesRef = useRef({});
  const signalsRef = useRef([]);

  // ─── Supabase Initialization ────────────────────────────────────────────────
  // When Supabase is configured, replace mock data with live DB data on mount
  // and subscribe to realtime changes. Falls back to mock data silently.
  const [hospitals, setHospitals] = useState(mockHospitals);

  useEffect(() => {
    if (!isSupabaseReady()) return; // No Supabase config — use mock data

    let cancelled = false;

    const init = async () => {
      // Load initial data from Supabase
      const [dbAmbs, dbSignals, dbAlerts, dbHospitals] = await Promise.all([
        getAmbulances(),
        getSignals(),
        getAlerts(),
        getHospitals(),
      ]);

      if (cancelled) return;

      if (dbAmbs && dbAmbs.length > 0) setAmbulances(dbAmbs);
      if (dbSignals && dbSignals.length > 0) setSignals(dbSignals);
      if (dbAlerts && dbAlerts.length > 0) setAlerts(dbAlerts);
      if (dbHospitals && dbHospitals.length > 0) setHospitals(dbHospitals);
    };

    init();

    // Start realtime subscriptions
    // ambulance: service calls onUpdate(prev => ...) — pass setter directly
    const unsubAmb = subscribeToAmbulances(setAmbulances);

    // signal: service calls onUpdate(prev => ...) — merge with any active manual override
    const unsubSig = subscribeToSignals(patchFn => {
      if (!cancelled) setSignals(prev => {
        const patched = patchFn(prev);
        return patched.map(sig => {
          const override = manualOverridesRef.current[sig.id];
          return override && Date.now() < override.expiry
            ? { ...sig, status: override.status }
            : sig;
        });
      });
    });

    const unsubAlert = subscribeToAlerts(newAlert => {
      if (!cancelled) setAlerts(prev => [newAlert, ...prev].slice(0, 8));
    });

    return () => {
      cancelled = true;
      unsubAmb();
      unsubSig();
      unsubAlert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    manualOverridesRef.current = manualOverrides;
    signalsRef.current = signals;
  }, [manualOverrides, signals]);

  // Main Simulation Loop
  useEffect(() => {
    if (systemStatus !== 'online') return;

    const interval = setInterval(() => {
      setAmbulances(prevAmbs => {
        const currentSignals = signalsRef.current;
        const currentManualOverrides = manualOverridesRef.current;

        const steppedAmbs = advanceAmbulances(prevAmbs, currentSignals);

        // --- HACKATHON ALERTS ENGINE ---
        const newAlerts = [];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        steppedAmbs.forEach(amb => {
          const prevAmb = prevAmbs.find(a => a.id === amb.id);
          if (!prevAmb) return;

          // --- STANDARDIZED COLOR & STATUS SYSTEM ---
          if (amb.status === 'Arrived') {
            amb.routeType = 'grey';
          } else if (amb.priority === 1) {
            amb.routeType = 'green';
            amb.status = 'Emergency';
          } else if (amb.isApproachingIntersection) {
            amb.routeType = 'yellow';
            amb.status = 'En Route';
          } else {
            amb.routeType = amb.trafficLoad === 'High' ? 'red' : 'blue';
            amb.status = 'Active';
          }

          // Alerts
          if (amb.status === 'Arrived' && prevAmb.status !== 'Arrived') {
            newAlerts.push({ id: `hosp-${Date.now()}-${amb.id}`, text: `Ambulance ${amb.id} reached hospital destination`, time: timestamp, type: 'hospital' });
          }
          if (amb.isApproachingIntersection && !prevAmb.isApproachingIntersection && amb.status === 'Active') {
            newAlerts.push({ id: `sig-${Date.now()}-${amb.id}`, text: `${amb.id} approaching ${amb.destination.split(' ')[0]} Intersection`, time: timestamp, type: 'signal' });
            newAlerts.push({ id: `sig-clear-${Date.now()}-${amb.id}`, text: `Signal clearance initiated ahead for ${amb.id}`, time: timestamp, type: 'warning' });
          }
          if (amb.priority === 1 && prevAmb.priority !== 1) {
            newAlerts.push({ id: `corr-${Date.now()}-${amb.id}`, text: `Corridor traffic cleared successfully for ${amb.id}`, time: timestamp, type: 'success' });
          }
        });

        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 8));
        }

        // --- TIMED OVERRIDES EXPIRY CHECK ---
        const now = Date.now();
        let overridesChanged = false;
        const updatedOverrides = { ...currentManualOverrides };

        Object.entries(updatedOverrides).forEach(([id, data]) => {
          if (now > data.expiry) {
            delete updatedOverrides[id];
            overridesChanged = true;
          }
        });

        if (overridesChanged) {
          setManualOverrides(updatedOverrides);
        }

        setSignals(prevSignals => {
          const automatedSignals = updateTrafficSignals(prevSignals, steppedAmbs);
          return automatedSignals.map(sig => {
            if (updatedOverrides[sig.id]) {
              return { ...sig, status: updatedOverrides[sig.id].status };
            }
            return sig;
          });
        });

        return steppedAmbs.map(amb => ({ ...amb, lastUpdateTime: Date.now() }));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [systemStatus]);
  // Added signals and manualOverrides to deps for accuracy

  // --- AUTOMATED ACTIONS ---

  const prioritizeAmbulance = (id) => {
    const driverId = id === 'AMB001' ? 'DRV102' : id === 'AMB002' ? 'DRV105' : 'DRV110';
    if (!verifyVehicle(id, driverId)) {
      setAlerts(prev => [{
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: `Unauthorized vehicle ${id} — access denied.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'warning'
      }, ...prev].slice(0, 8));
      return;
    }

    setAmbulances(prev => prev.map(amb => amb.id === id ? { ...amb, priority: 1, routeType: 'green' } : amb));
    logAction(`Prioritized Ambulance ${id}`);
    setAlerts(prev => [{
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `Corridor Initialized. Ambulance ${id} escalated to Priority 1.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'warning'
    }, ...prev].slice(0, 8));
  };


  const setSignalStatus = (id, status, durationMinutes = 0) => {
    if (durationMinutes > 0) {
      const expiry = Date.now() + durationMinutes * 60000;
      setManualOverrides(prev => ({ ...prev, [id]: { status, expiry } }));
      logAction(`Signal ${id} overridden to ${status} for ${durationMinutes} min`);
    } else {
      setSignals(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      logAction(`Signal ${id} manually overridden to ${status} by officer`);
    }

    setAlerts(prev => [{
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `Signal ${id} ${durationMinutes > 0 ? `timed (${durationMinutes}m)` : ''} override activated.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'info'
    }, ...prev].slice(0, 8));
  };


  const overrideSignals = () => {
    setSignals(prev => prev.map(s => ({ ...s, status: 'green' })));
    logAction('Emergency Signal Override Activated');
    setAlerts(prev => [{
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `Emergency Signal Override Activated`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'success'
    }, ...prev].slice(0, 8));

    setTimeout(() => {
      setSignals(prev => updateTrafficSignals(prev, ambulances, false));
    }, 10000);
  };

  const value = {
    ambulances,
    setAmbulances,
    signals,
    setSignals,
    hospitals,
    alerts,
    setAlerts,
    analytics,
    setAnalytics,
    prioritizeAmbulance,
    overrideSignals,
    setSignalStatus,
    triggerEmergency: dbTriggerEmergency,
    resetSimulation,
    systemStatus,
    setSystemStatus,
    focusedAmbulanceId,
    setFocusedAmbulanceId,
    trafficLoad,
    setTrafficLoad,
    manualOverrides,
    myLocation: null,
    setMyLocation: () => { }
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
