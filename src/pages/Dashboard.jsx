import { supabase } from "../lib/supabaseClient";
import { useEffect } from "react";
import MapView from '../components/MapView';
import AnalyticsCards from '../components/AnalyticsCards';
import HospitalCapacityPanel from '../components/HospitalCapacityPanel';

export default function Dashboard() {

  useEffect(() => {
    async function testSupabaseConnection() {
      if (!supabase) {
        console.warn('[LifeLane AI] Supabase not configured — using mock data.');
        return;
      }
      const { data, error } = await supabase.from('ambulances').select('*');
      if (error) {
        console.error('[LifeLane AI] Supabase connection error:', error.message);
      } else {
        console.log('[LifeLane AI] Supabase connected. Ambulances:', data);
      }
    }
    testSupabaseConnection();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Area */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Global View</h1>
          <p className="text-sm text-textPrimary/60">Real-time emergency traffic monitoring</p>
        </div>
      </div>

      {/* Top Section: Analytics */}
      <div className="flex flex-col px-4">
        <div className="w-full">
          <AnalyticsCards />
        </div>
      </div>

      {/* Main Map & Readiness Area */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4 px-4 pb-4 min-h-0 mt-4">
        <div className="flex-[3] relative rounded-2xl overflow-hidden glass-panel border border-white/10 p-1 h-full min-h-[400px]">
          <MapView />
        </div>
        <div className="flex-1 hidden xl:block h-full">
          <HospitalCapacityPanel />
        </div>
      </div>
    </div>
  );
}
