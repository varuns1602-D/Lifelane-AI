-- ============================================================
-- LifeLane AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- -----------------------------------------------
-- Extensions
-- -----------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- for faster text search


-- -----------------------------------------------
-- TABLE: officers
-- Stores police officers who can log into the dashboard
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS officers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id        text NOT NULL,
  officer_badge_id  text NOT NULL UNIQUE,
  email             text NOT NULL UNIQUE,
  otp_code          text,
  otp_expiry        timestamptz,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- Seed default officer (matches AuthContext mock)
INSERT INTO officers (station_id, officer_badge_id, email) VALUES
  ('BLR-TC-001', 'POL-7729', 'officer@traffic.gov')
ON CONFLICT (officer_badge_id) DO NOTHING;


-- -----------------------------------------------
-- TABLE: hospitals
-- Hospitals available for emergency routing
-- Matches mockHospitals shape in mockData.js
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
  hospital_id       text PRIMARY KEY,
  hospital_name     text NOT NULL,
  location          jsonb NOT NULL,    -- { "lat": 12.96, "lng": 77.57 }
  beds_available    integer DEFAULT 0,
  icu_available     integer DEFAULT 0,
  trauma_level      integer DEFAULT 1,
  status            text DEFAULT 'operational' -- operational | full | offline
);

-- Seed data matching mockHospitals
INSERT INTO hospitals VALUES
  ('H1', 'Victoria Hospital',  '{"lat": 12.9631, "lng": 77.5746}', 12, 4, 1, 'operational'),
  ('H2', 'St. John''s Hospital','{"lat": 12.9298, "lng": 77.6202}',  8, 2, 2, 'operational'),
  ('H3', 'Manipal Hospital',   '{"lat": 12.9591, "lng": 77.6485}', 15, 7, 1, 'operational')
ON CONFLICT (hospital_id) DO NOTHING;


-- -----------------------------------------------
-- TABLE: authorized_vehicles
-- VAC (Vehicle Authentication & Control) system
-- Matches authorizedVehicles in mockData.js
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS authorized_vehicles (
  vehicle_id        text PRIMARY KEY,
  driver_id         text NOT NULL,
  vehicle_type      text NOT NULL DEFAULT 'ambulance',
  registration      text NOT NULL,
  status            text NOT NULL DEFAULT 'verified' -- verified | suspended | pending
);

INSERT INTO authorized_vehicles VALUES
  ('AMB001', 'DRV102', 'ambulance', 'KA-01-EM-1234', 'verified'),
  ('AMB002', 'DRV105', 'ambulance', 'KA-01-EM-5678', 'verified'),
  ('AMB003', 'DRV110', 'ambulance', 'KA-01-EM-9012', 'verified')
ON CONFLICT (vehicle_id) DO NOTHING;


-- -----------------------------------------------
-- TABLE: ambulances
-- Live ambulance tracking state
-- Matches mockAmbulances shape in mockData.js
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ambulances (
  ambulance_id        text PRIMARY KEY,
  driver_id           text REFERENCES authorized_vehicles(driver_id),
  current_location    jsonb NOT NULL,  -- { "lat": 12.97, "lng": 77.60 }
  speed               numeric DEFAULT 0,
  status              text DEFAULT 'Active',    -- Active | Emergency | En Route | Arrived
  priority            integer DEFAULT 2,        -- 1 (critical) | 2 (high) | 3 (standard)
  destination         text,
  hospital_id         text REFERENCES hospitals(hospital_id),
  eta                 text DEFAULT '00:00',     -- MM:SS string
  progress            numeric DEFAULT 0,        -- 0-100 percent
  route_type          text DEFAULT 'blue',      -- green | yellow | red | blue | grey
  route_coordinates   jsonb,                    -- array of [lat, lng] waypoints
  route_step          integer DEFAULT 0,
  updated_at          timestamptz DEFAULT now()
);

-- Seed data matching mockAmbulances
INSERT INTO ambulances (ambulance_id, driver_id, current_location, speed, status, priority, destination, hospital_id, route_type) VALUES
  ('AMB001', 'DRV102', '{"lat": 12.9750, "lng": 77.6000}', 65, 'Active', 1, 'Victoria Hospital',   'H1', 'green'),
  ('AMB002', 'DRV105', '{"lat": 12.9100, "lng": 77.6000}', 55, 'Active', 2, 'St. John''s Hospital','H2', 'yellow'),
  ('AMB003', 'DRV110', '{"lat": 12.9800, "lng": 77.6600}', 50, 'Active', 1, 'Manipal Hospital',    'H3', 'green')
ON CONFLICT (ambulance_id) DO NOTHING;


-- -----------------------------------------------
-- TABLE: signals
-- City traffic signal states
-- Matches mockSignals shape in mockData.js
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS signals (
  signal_id           text PRIMARY KEY,
  location            jsonb NOT NULL,   -- { "lat": 12.97, "lng": 77.59 }
  status              text DEFAULT 'red',  -- red | green | yellow
  intersection_name   text,
  manual_override     boolean DEFAULT false,
  override_expiry     timestamptz,
  updated_at          timestamptz DEFAULT now()
);

INSERT INTO signals VALUES
  ('S1',   '{"lat": 12.9720, "lng": 77.5950}', 'red',   'MG Road',          false, null, now()),
  ('S2',   '{"lat": 12.9690, "lng": 77.5850}', 'red',   'Approaching Victoria', false, null, now()),
  ('S3',   '{"lat": 12.9650, "lng": 77.5800}', 'red',   'Near Victoria',    false, null, now()),
  ('S4',   '{"lat": 12.9400, "lng": 77.6100}', 'red',   'Koramangala Route',false, null, now()),
  ('S5',   '{"lat": 12.9600, "lng": 77.6300}', 'red',   'Indiranagar Route',false, null, now()),
  ('S102', '{"lat": 12.9500, "lng": 77.6300}', 'red',   'Simulation Node',  false, null, now())
ON CONFLICT (signal_id) DO NOTHING;


-- -----------------------------------------------
-- TABLE: emergencies
-- Active emergency events triggered by ambulances
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS emergencies (
  emergency_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambulance_id        text REFERENCES ambulances(ambulance_id),
  patient_known       boolean DEFAULT false,
  preferred_hospital  text REFERENCES hospitals(hospital_id),
  criticality         text DEFAULT 'medium',   -- critical | high | medium | low
  selected_hospital   text REFERENCES hospitals(hospital_id),
  status              text DEFAULT 'active',   -- active | routing | in_progress | arrived | closed
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);


-- -----------------------------------------------
-- TABLE: alerts
-- Dashboard alert feed messages
-- Matches mockAlerts shape in mockData.js
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  alert_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message     text NOT NULL,
  type        text DEFAULT 'info',  -- info | success | warning | signal | hospital
  ambulance_id text,
  timestamp   timestamptz DEFAULT now()
);

-- Seed initial alerts
INSERT INTO alerts (message, type) VALUES
  ('Corridor traffic optimization active', 'success'),
  ('AI Traffic rerouting enabled', 'info');


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Keep tables private by default; only authenticated users access them.
-- ============================================================

ALTER TABLE officers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to SELECT all tables
CREATE POLICY "Authenticated read: officers"           ON officers           FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: hospitals"          ON hospitals          FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: authorized_vehicles" ON authorized_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: ambulances"         ON ambulances         FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: signals"            ON signals            FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: emergencies"        ON emergencies        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: alerts"             ON alerts             FOR SELECT TO authenticated USING (true);

-- Allow service_role (n8n) to do everything
CREATE POLICY "Service role full access: ambulances"   ON ambulances         FOR ALL  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access: signals"      ON signals            FOR ALL  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access: emergencies"  ON emergencies        FOR ALL  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access: alerts"       ON alerts             FOR ALL  TO service_role USING (true) WITH CHECK (true);


-- ============================================================
-- REALTIME PUBLICATION
-- Enable realtime for dashboard-facing tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE ambulances;
ALTER PUBLICATION supabase_realtime ADD TABLE signals;
ALTER PUBLICATION supabase_realtime ADD TABLE emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;


-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate and store a 6-digit OTP for an officer
CREATE OR REPLACE FUNCTION generate_officer_otp(p_officer_badge_id text, p_station_id text, p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp text;
  v_officer_id uuid;
BEGIN
  -- Verify officer exists
  SELECT id INTO v_officer_id
  FROM officers
  WHERE officer_badge_id = p_officer_badge_id
    AND station_id = p_station_id
    AND email = p_email
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Officer not found or credentials invalid';
  END IF;

  -- Generate 6-digit OTP
  v_otp := LPAD((FLOOR(RANDOM() * 899999) + 100000)::text, 6, '0');

  -- Store OTP with 60-second expiry
  UPDATE officers
  SET otp_code   = v_otp,
      otp_expiry = now() + INTERVAL '60 seconds'
  WHERE id = v_officer_id;

  RETURN v_otp;
END;
$$;


-- Verify OTP and return officer profile
CREATE OR REPLACE FUNCTION verify_officer_otp(p_officer_badge_id text, p_otp text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_officer officers%ROWTYPE;
BEGIN
  SELECT * INTO v_officer
  FROM officers
  WHERE officer_badge_id = p_officer_badge_id
    AND otp_code = p_otp
    AND otp_expiry > now()
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired OTP';
  END IF;

  -- Invalidate OTP after use
  UPDATE officers SET otp_code = null, otp_expiry = null WHERE id = v_officer.id;

  RETURN jsonb_build_object(
    'id',            v_officer.id,
    'station_id',    v_officer.station_id,
    'officer_badge_id', v_officer.officer_badge_id,
    'email',         v_officer.email
  );
END;
$$;


-- Helper: insert a system alert
CREATE OR REPLACE FUNCTION insert_alert(p_message text, p_type text DEFAULT 'info', p_ambulance_id text DEFAULT null)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO alerts (message, type, ambulance_id) VALUES (p_message, p_type, p_ambulance_id);
END;
$$;


-- Signal clearance: called by n8n or trigger
-- Clears signals within 300m of an ambulance position
CREATE OR REPLACE FUNCTION clear_signals_for_ambulance(p_ambulance_id text, p_lat double precision, p_lng double precision)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  sig RECORD;
  v_distance double precision;
BEGIN
  FOR sig IN SELECT * FROM signals WHERE status != 'green' LOOP
    -- Haversine approximation (degree delta × ~111km)
    v_distance := SQRT(
      POWER((sig.location->>'lat')::double precision - p_lat, 2) +
      POWER((sig.location->>'lng')::double precision - p_lng, 2)
    ) * 111000; -- convert degrees to meters

    IF v_distance <= 300 THEN
      UPDATE signals SET status = 'green', updated_at = now() WHERE signal_id = sig.signal_id;
      PERFORM insert_alert(
        'Signal ' || sig.signal_id || ' cleared ahead for ' || p_ambulance_id,
        'signal',
        p_ambulance_id
      );
    END IF;
  END LOOP;
END;
$$;


-- Trigger on ambulances: auto-clear signals when location updates
CREATE OR REPLACE FUNCTION ambulance_location_update_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_location IS DISTINCT FROM OLD.current_location THEN
    PERFORM clear_signals_for_ambulance(
      NEW.ambulance_id,
      (NEW.current_location->>'lat')::double precision,
      (NEW.current_location->>'lng')::double precision
    );
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ambulance_location
  BEFORE UPDATE ON ambulances
  FOR EACH ROW
  EXECUTE FUNCTION ambulance_location_update_trigger();


-- Trigger on emergencies: fire alert when new emergency inserted
CREATE OR REPLACE FUNCTION emergency_created_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM insert_alert(
    'EMERGENCY TRIGGERED — Ambulance ' || NEW.ambulance_id || ' [' || UPPER(NEW.criticality) || ']',
    'warning',
    NEW.ambulance_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_emergency
  AFTER INSERT ON emergencies
  FOR EACH ROW
  EXECUTE FUNCTION emergency_created_trigger();


-- Trigger on emergencies: alert when hospital selected
CREATE OR REPLACE FUNCTION emergency_hospital_selected_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_hospital_name text;
BEGIN
  IF NEW.selected_hospital IS DISTINCT FROM OLD.selected_hospital AND NEW.selected_hospital IS NOT NULL THEN
    SELECT hospital_name INTO v_hospital_name FROM hospitals WHERE hospital_id = NEW.selected_hospital;
    PERFORM insert_alert(
      'Route assigned: ' || NEW.ambulance_id || ' → ' || COALESCE(v_hospital_name, NEW.selected_hospital),
      'success',
      NEW.ambulance_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hospital_selected
  AFTER UPDATE ON emergencies
  FOR EACH ROW
  EXECUTE FUNCTION emergency_hospital_selected_trigger();
