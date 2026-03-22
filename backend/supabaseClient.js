/**
 * LifeLane AI — Supabase Backend Bridge
 * 
 * This file provides a Supabase client and real-time subscription helpers
 * that can be optionally connected to SimulationContext.jsx and AuthContext.jsx
 * WITHOUT modifying the original frontend logic.
 *
 * HOW TO USE:
 * 1. Create a .env file in the project root with your Supabase credentials:
 *    VITE_SUPABASE_URL=https://your-project.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * 2. In SimulationContext.jsx, optionally import and call subscribeToAmbulances()
 *    to receive realtime location updates from Supabase instead of mock data.
 *
 * 3. In AuthContext.jsx, replace loginStep1/verifyOTP with the Supabase auth
 *    functions below to validate officers against the database.
 */

import { createClient } from '@supabase/supabase-js';

// --- Supabase Client ---

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});


// ============================================================
// AUTH: Officer Login via Supabase DB Functions
// ============================================================

/**
 * Step 1: Generate OTP via DB function. Returns the OTP (for console display).
 * In production, this would be emailed via Supabase or a third-party provider.
 */
export async function requestOTP(stationId, officerBadgeId, email) {
  const { data, error } = await supabase.rpc('generate_officer_otp', {
    p_station_id: stationId,
    p_officer_badge_id: officerBadgeId,
    p_email: email,
  });

  if (error) {
    console.error('OTP generation failed:', error.message);
    return null;
  }

  console.log('[SYSTEM AUTH] OTP Generated:', data); // Dev-only. Remove in production.
  return data;
}

/**
 * Step 2: Verify OTP and retrieve officer profile.
 * Returns officer object on success, null on failure.
 */
export async function verifyOTPFromDB(officerBadgeId, otp) {
  const { data, error } = await supabase.rpc('verify_officer_otp', {
    p_officer_badge_id: officerBadgeId,
    p_otp: otp,
  });

  if (error) {
    console.error('OTP verification failed:', error.message);
    return null;
  }

  return data;
}


// ============================================================
// REALTIME: Ambulance Location Updates
// ============================================================

/**
 * Subscribe to real-time ambulance position changes.
 * Usage: const unsub = subscribeToAmbulances((ambulances) => setAmbulances(ambulances));
 * Returns a cleanup function to call on unmount.
 */
export function subscribeToAmbulances(onUpdate) {
  const channel = supabase
    .channel('ambulances-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ambulances' },
      async () => {
        // Refetch the full list on any change to maintain consistent state
        const { data } = await supabase
          .from('ambulances')
          .select('*')
          .order('ambulance_id');
        if (data) {
          // Normalize DB shape → frontend shape
          onUpdate(data.map(normalizeAmbulance));
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/** Normalize Supabase ambulance row → frontend mockAmbulances shape */
function normalizeAmbulance(row) {
  return {
    id:                row.ambulance_id,
    priority:          row.priority,
    status:            row.status,
    destination:       row.destination || '',
    speed:             row.speed,
    eta:               row.eta || '00:00',
    routeType:         row.route_type || 'blue',
    progress:          row.progress || 0,
    routeCoordinates:  row.route_coordinates || [],
    routeStep:         row.route_step || 0,
    currentLocation:   [row.current_location?.lat, row.current_location?.lng],
  };
}


// ============================================================
// REALTIME: Signal Status Updates
// ============================================================

export function subscribeToSignals(onUpdate) {
  const channel = supabase
    .channel('signals-realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'signals' },
      async () => {
        const { data } = await supabase.from('signals').select('*');
        if (data) {
          onUpdate(data.map(row => ({
            id:       row.signal_id,
            position: [row.location?.lat, row.location?.lng],
            status:   row.status,
          })));
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}


// ============================================================
// REALTIME: Alert Feed
// ============================================================

export function subscribeToAlerts(onNewAlert) {
  const channel = supabase
    .channel('alerts-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => {
        const row = payload.new;
        onNewAlert({
          id:   row.alert_id,
          text: row.message,
          type: row.type,
          time: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}


// ============================================================
// WRITE OPERATIONS (for future dashboard actions)
// ============================================================

/** Manually override a signal status */
export async function overrideSignal(signalId, status) {
  const { error } = await supabase
    .from('signals')
    .update({ status, manual_override: true, updated_at: new Date().toISOString() })
    .eq('signal_id', signalId);

  if (error) console.error('Signal override failed:', error);
}

/** Trigger a new emergency event */
export async function triggerEmergency(ambulanceId, criticality = 'high', preferredHospital = null, patientKnown = false) {
  const { error } = await supabase.from('emergencies').insert({
    ambulance_id:       ambulanceId,
    criticality,
    patient_known:      patientKnown,
    preferred_hospital: preferredHospital,
    status:             'active',
  });

  if (error) console.error('Emergency trigger failed:', error);
}

/** Update ambulance live position */
export async function updateAmbulanceLocation(ambulanceId, lat, lng, speed, progress, eta) {
  const { error } = await supabase
    .from('ambulances')
    .update({
      current_location: { lat, lng },
      speed,
      progress,
      eta,
      updated_at: new Date().toISOString(),
    })
    .eq('ambulance_id', ambulanceId);

  if (error) console.error('Ambulance update failed:', error);
}
