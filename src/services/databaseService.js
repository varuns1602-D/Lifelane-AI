/**
 * LifeLane AI — Database Service Layer
 * All Supabase CRUD and realtime functions live here.
 * SimulationContext and AuthContext call these functions; 
 * no UI components import this file directly.
 */

import { supabase } from '../lib/supabaseClient';

// ─── Guard helper ────────────────────────────────────────────────────────────
/** Returns true when Supabase is properly configured. */
export const isSupabaseReady = () => Boolean(supabase);


// ─── READ operations ──────────────────────────────────────────────────────────

/** Fetch all ambulances and return them in the frontend shape expected by SimulationContext. */
export const getAmbulances = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('ambulances').select('*');
  if (error) { console.error('[DB] getAmbulances:', error.message); return null; }
  return data.map(normalizeAmbulance);
};

/** Fetch all traffic signals. */
export const getSignals = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('signals').select('*');
  if (error) { console.error('[DB] getSignals:', error.message); return null; }
  return data.map(normalizeSignal);
};

/** Fetch all hospitals. */
export const getHospitals = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('hospitals').select('*');
  if (error) { console.error('[DB] getHospitals:', error.message); return null; }
  return data.map(normalizeHospital);
};

/** Fetch active emergencies. */
export const getEmergencies = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .in('status', ['active', 'routing', 'in_progress'])
    .order('created_at', { ascending: false });
  if (error) { console.error('[DB] getEmergencies:', error.message); return null; }
  return data;
};

/** Fetch latest 20 alerts for the dashboard feed. */
export const getAlerts = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20);
  if (error) { console.error('[DB] getAlerts:', error.message); return null; }
  return data.map(normalizeAlert);
};


// ─── WRITE operations ─────────────────────────────────────────────────────────

/**
 * Trigger a new emergency event.
 * Inserts into the emergencies table which fires DB triggers + optional n8n webhook.
 */
export const triggerEmergency = async (ambulanceId, criticality = 'high', preferredHospital = null, patientKnown = false) => {
  if (!supabase) return;
  const { error } = await supabase.from('emergencies').insert({
    ambulance_id:       ambulanceId,
    criticality,
    patient_known:      patientKnown,
    preferred_hospital: preferredHospital,
    status:             'active',
  });
  if (error) console.error('[DB] triggerEmergency:', error.message);
};

/**
 * Manually override a signal status in the database.
 * The realtime subscription will push the change back to the UI.
 */
export const updateSignalStatus = async (signalId, status) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('signals')
    .update({ status, manual_override: true, updated_at: new Date().toISOString() })
    .eq('signal_id', signalId);
  if (error) console.error('[DB] updateSignalStatus:', error.message);
};

/**
 * Push a live ambulance location update to Supabase.
 * The DB trigger will then clear nearby signals automatically.
 */
export const pushAmbulanceLocation = async (ambulanceId, lat, lng, speed, progress, eta, status) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('ambulances')
    .update({
      current_location: { lat, lng },
      speed,
      progress,
      eta,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('ambulance_id', ambulanceId);
  if (error) console.error('[DB] pushAmbulanceLocation:', error.message);
};


// ─── REALTIME subscriptions ───────────────────────────────────────────────────

/**
 * Subscribe to live ambulance updates.
 * @param {(ambulances: Array) => void} onUpdate  Called with the full normalized ambulance list on every change.
 * @returns Cleanup function — call it on unmount.
 */
export function subscribeToAmbulances(onUpdate) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('lifelane-ambulances')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, (payload) => {
      if (payload.new) {
        // Patch: merge the single updated row into the existing list
        onUpdate(prev => prev.map(a => {
          if (a.id === payload.new.ambulance_id) {
            const normalized = normalizeAmbulance(payload.new);
            return {
              ...a,
              ...normalized,
              lastLocation: a.currentLocation,
              lastUpdateTime: Date.now()
            };
          }
          return a;
        }));
      }
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to signal status changes.
 * @param {(signals: Array) => void} onUpdate
 * @returns Cleanup function.
 */
export function subscribeToSignals(onUpdate) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('lifelane-signals')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'signals' }, (payload) => {
      if (payload.new) {
        // Patch: flip only the changed signal in the existing list
        const updated = normalizeSignal(payload.new);
        onUpdate(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      }
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to new alerts — appends each new row to the dashboard feed.
 * @param {(alert: Object) => void} onNewAlert  Called with a single normalized alert on INSERT.
 * @returns Cleanup function.
 */
export function subscribeToAlerts(onNewAlert) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('lifelane-alerts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
      onNewAlert(normalizeAlert(payload.new));
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to emergency status changes.
 * @param {(emergency: Object) => void} onUpdate
 * @returns Cleanup function.
 */
export function subscribeToEmergencies(onUpdate) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('lifelane-emergencies')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'emergencies' }, (payload) => {
      onUpdate(payload.new);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}


// ─── Shape normalizers ────────────────────────────────────────────────────────
// Convert DB row format → frontend format expected by SimulationContext / MapView

function normalizeAmbulance(row) {
  return {
    id:               row.ambulance_id,
    priority:         row.priority ?? 2,
    status:           row.status ?? 'Active',
    destination:      row.destination ?? '',
    speed:            row.speed ?? 0,
    eta:              row.eta ?? '00:00',
    routeType:        row.route_type ?? 'blue',
    progress:         row.progress ?? 0,
    routeCoordinates: row.route_coordinates ?? [],
    routeStep:        row.route_step ?? 0,
    currentLocation:  [
      row.current_location?.lat ?? 0,
      row.current_location?.lng ?? 0,
    ],
    hospitalId:       row.hospital_id,
  };
}

function normalizeSignal(row) {
  return {
    id:       row.signal_id,
    position: [
      row.location?.lat ?? 0,
      row.location?.lng ?? 0,
    ],
    status:   row.status ?? 'red',
  };
}

function normalizeHospital(row) {
  return {
    id:       row.hospital_id,
    name:     row.hospital_name,
    position: [
      row.location?.lat ?? 0,
      row.location?.lng ?? 0,
    ],
    capacity: {
      emergencyBeds: row.beds_available ?? 0,
      icuAvailable:  row.icu_available ?? 0,
    },
    status:   row.status,
  };
}

function normalizeAlert(row) {
  return {
    id:   row.alert_id ?? row.id ?? `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: row.message ?? row.text,
    type: row.type ?? 'info',
    time: row.timestamp
      ? new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
