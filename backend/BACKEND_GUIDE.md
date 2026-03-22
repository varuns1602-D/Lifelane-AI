# LifeLane AI — Backend Integration Guide

## Stack
| Layer | Technology | Purpose |
|---|---|---|
| Database | Supabase (PostgreSQL) | Tables, auth, realtime, triggers |
| Automation | n8n | Workflows for routing, signals, alerts |
| Frontend | React + TailwindCSS | Existing dashboard (DO NOT MODIFY) |

---

## Step 1 — Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Name it: `lifelane-ai`
3. Note your **Project URL** and **anon key** from `Settings > API`.

---

## Step 2 — Run the SQL Schema

1. Open your Supabase project → **SQL Editor** → **New Query**.
2. Paste the entire contents of `backend/supabase_schema.sql`.
3. Click **Run**.

This creates all tables, seeds data, enables Realtime, and installs triggers and functions.

### Tables Created
| Table | Purpose |
|---|---|
| `officers` | Police station login credentials and OTP |
| `ambulances` | Live vehicle tracking state |
| `hospitals` | Available routing destinations |
| `emergencies` | Active emergency events |
| `signals` | City traffic signal states |
| `alerts` | Dashboard alert feed |
| `authorized_vehicles` | VAC (Vehicle Authentication) list |

---

## Step 3 — Enable Realtime in Supabase Dashboard

The SQL already runs `ALTER PUBLICATION`, but confirm these tables are enabled:

1. Supabase → **Database** → **Replication** → **0 Tables** dropdown.
2. Enable for: `ambulances`, `signals`, `emergencies`, `alerts`.

---

## Step 4 — Environment Variables

Create a `.env` file in the React project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

These are used by `backend/supabaseClient.js`.

---

## Step 5 — Install Supabase JS SDK

In the project root, run:

```bash
npm install @supabase/supabase-js
```

---

## Step 6 — Connect Frontend to Supabase (Optional Integration)

The existing frontend works with mock data out of the box. To switch to live Supabase data:

### A. AuthContext — Supabase OTP Login

In `src/context/AuthContext.jsx`, you can replace the local OTP with:

```js
// Import from the bridge
import { requestOTP, verifyOTPFromDB } from '../../backend/supabaseClient';

// In loginStep1:
const otp = await requestOTP(stationId, officerId, email);
// OTP is stored in the DB for 60 seconds, returned for dev console display

// In verifyOTP:
const officer = await verifyOTPFromDB(officerBadgeId, otp);
if (officer) { /* proceed */ }
```

### B. SimulationContext — Live Ambulance Updates

In `src/context/SimulationContext.jsx`, add realtime subscription:

```js
import { subscribeToAmbulances, subscribeToSignals, subscribeToAlerts } from '../../backend/supabaseClient';

// Inside useEffect:
const unsubAmb   = subscribeToAmbulances(setAmbulances);
const unsubSig   = subscribeToSignals(setSignals);
const unsubAlert = subscribeToAlerts(newAlert => setAlerts(prev => [newAlert, ...prev].slice(0, 8)));

return () => { unsubAmb(); unsubSig(); unsubAlert(); };
```

---

## Step 7 — n8n Workflow Setup

### Install n8n
```bash
npm install -g n8n
n8n start
```
Open at `http://localhost:5678`.

### Configure Credentials
In n8n → **Credentials** → **New**:
- Type: **HTTP Header Auth**
- Name: `SupabaseServiceKey`
- Header: `apikey`
- Value: your Supabase **service_role** key (from Settings > API)

Set these environment variables for n8n:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Import Workflows
1. n8n → **Workflows** → **Import from File**
2. Import `backend/n8n_emergency_routing_workflow.json`
3. Import `backend/n8n_signal_clearance_workflow.json`
4. Activate both workflows.

### n8n Webhook URLs (after import)
| Workflow | Webhook Path |
|---|---|
| Emergency Routing | `http://localhost:5678/webhook/emergency-trigger` |
| Signal Clearance | `http://localhost:5678/webhook/signal-clearance` |

---

## Step 8 — Connect Supabase Webhooks → n8n

To auto-trigger n8n when a new emergency is inserted:

1. Supabase → **Database** → **Webhooks** → **Create new webhook**.
2. Name: `emergency-created`
3. Table: `emergencies`, Event: `INSERT`
4. URL: `http://your-n8n-host:5678/webhook/emergency-trigger`

---

## Data Flow

```
Officer Login
  │
  ├─ AuthContext → supabase.rpc('generate_officer_otp') → DB stores OTP
  └─ Verify OTP  → supabase.rpc('verify_officer_otp')  → Session granted
                                          │
Ambulance Emergency Event                 ▼
  │                            SimulationContext subscribes to
  ├─ INSERT into emergencies    ambulances / signals / alerts tables
  │                            via Supabase Realtime channels
  ├─ DB Trigger fires alert                │
  │  "EMERGENCY TRIGGERED"                 ▼
  │                             Dashboard updates automatically:
  ├─ Supabase Webhook → n8n     • Ambulance markers move
  │  EmergencyRoutingWorkflow   • Signal lights change color
  │  • Selects hospital         • Alerts panel receives live feed
  │  • PATCH emergency record
  │                            
Ambulance Location Update
  │
  ├─ UPDATE ambulances.current_location
  ├─ DB Trigger clears signals within 300m
  └─ Realtime pushes to dashboard (marker moves on map)
```

---

## Security Notes

- **RLS policies** ensure only authenticated users can read tables.
- **Service role key** is only used in n8n (server-side) — never expose it in the frontend.
- **OTP functions** use `SECURITY DEFINER` to safely access the `officers` table.
- The `000000` dev backdoor OTP in AuthContext should be **removed in production**.

---

## Environment Variables Reference

| Variable | Where Used | Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend `.env` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend `.env` | `eyJhbGc...` (anon public key) |
| `SUPABASE_URL` | n8n env | same URL |
| `SUPABASE_SERVICE_KEY` | n8n env | service_role secret key |

---

## Files in `backend/`

| File | Purpose |
|---|---|
| `supabase_schema.sql` | Full database schema, seed data, triggers, functions |
| `supabaseClient.js` | Supabase JS client and realtime helpers |
| `n8n_emergency_routing_workflow.json` | Import into n8n — selects hospital for emergency |
| `n8n_signal_clearance_workflow.json` | Import into n8n — clears signals near ambulance |
| `BACKEND_GUIDE.md` | This file |
