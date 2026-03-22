# LifeLane AI — n8n Workflows Setup Guide

## All Workflows

| # | File | Trigger | Purpose |
|---|---|---|---|
| 1 | `n8n_emergency_routing_workflow.json` | Supabase Webhook → `emergencies` INSERT | AI hospital selection |
| 2 | `n8n_signal_clearance_workflow.json` | Supabase Webhook → `ambulances` UPDATE | Clear signals within 300m |
| 3 | `n8n_traffic_rerouting_workflow.json` | Supabase Webhook → `signals` UPDATE | AI reroute on congestion |
| 4 | `n8n_ambulance_movement_workflow.json` | Cron every 2 seconds | Simulate ambulance movement |
| 5 | `n8n_live_analytics_workflow.json` | Cron every 10 seconds | Push live analytics alerts |

---

## Step 1 — Install & Start n8n

```bash
npm install -g n8n
n8n start
``` 
Open: `http://localhost:5678`

---

## Step 2 — Set Environment Variables

In n8n → **Settings** → **Variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://cyitprkypcthidpmzk.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your **service_role** key (Settings → API → service_role) |

> [!CAUTION]
> Use the **service_role** key in n8n ONLY. Never put it in the frontend `.env`.

---

## Step 3 — Import All Workflows

1. n8n → **Workflows** → **+ New** → **Import from File**
2. Import each `.json` file from the `backend/` folder
3. Activate all imported workflows

---

## Step 4 — Run Supabase Addendum SQL

In Supabase → **SQL Editor**, run `backend/supabase_addendum.sql` to create:
- `get_analytics_snapshot()` function (used by analytics workflow)
- Performance indexes on key tables

---

## Step 5 — Configure Supabase Webhooks → n8n

Go to Supabase → **Database** → **Webhooks** and create:

### Webhook 1: Emergency Routing
| Field | Value |
|---|---|
| Name | `emergency-created` |
| Table | `emergencies` |
| Events | `INSERT` |
| URL | `http://your-n8n-host:5678/webhook/emergency-trigger` |

### Webhook 2: Signal Clearance
| Field | Value |
|---|---|
| Name | `ambulance-moved` |
| Table | `ambulances` |
| Events | `UPDATE` |
| URL | `http://your-n8n-host:5678/webhook/signal-clearance` |

### Webhook 3: Traffic Rerouting
| Field | Value |
|---|---|
| Name | `signal-changed` |
| Table | `signals` |
| Events | `UPDATE` |
| URL | `http://your-n8n-host:5678/webhook/reroute-trigger` |

---

## Step 6 — Verify Data Flow

1. **Activate** the `AmbulanceMovementSimulation` workflow — ambulances will start moving every 2 seconds.
2. Open the React dashboard — map markers should update in real time via Supabase Realtime.
3. **Insert a test emergency** in Supabase SQL Editor:
   ```sql
   INSERT INTO emergencies (ambulance_id, criticality, status)
   VALUES ('AMB001', 'high', 'active');
   ```
4. Watch n8n execute the EmergencyRoutingWorkflow and assign a hospital.
5. Alerts should appear in the React dashboard sidebar feed automatically.

---

## Full Data Flow

```
AmbulanceMovementSimulation (n8n, every 2s)
  └─► PATCH ambulances.current_location
        └─► Supabase DB trigger clears signals within 300m
              └─► Realtime → React map marker moves
                  └─► Realtime → Signal lights flip green

Supabase Webhook (ambulances UPDATE)
  └─► n8n SignalClearanceWorkflow (additional manual clearance)

Officer clicks "Trigger Emergency" → emergencies INSERT
  └─► Supabase Webhook → n8n EmergencyRoutingWorkflow
        └─► SELECT best hospital
              └─► UPDATE emergencies.selected_hospital
                    └─► DB trigger → INSERT alert
                          └─► Realtime → React alert feed

LiveAnalyticsUpdate (n8n, every 10s)
  └─► get_analytics_snapshot()
        └─► INSERT analytics alert → Realtime → React sidebar
```

---

## Webhook URLs Reference

When running n8n locally:

| Workflow | Webhook URL |
|---|---|
| Emergency Routing | `http://localhost:5678/webhook/emergency-trigger` |
| Signal Clearance | `http://localhost:5678/webhook/signal-clearance` |
| Traffic Rerouting | `http://localhost:5678/webhook/reroute-trigger` |

For cloud n8n, replace `localhost:5678` with your n8n instance URL.
