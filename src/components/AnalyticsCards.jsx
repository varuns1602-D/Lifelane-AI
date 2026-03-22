import { Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useSimulation } from '../context/useSimulation';

export default function AnalyticsCards() {
  const { analytics } = useSimulation();

  const cards = [
    { label: 'Active Emergencies', value: analytics.activeEmergencies, icon: <Activity className="text-corridorGreen" size={20} /> },
    { label: 'Signals Controlled', value: analytics.signalsControlled, icon: <Zap className="text-routeYellow" size={20} /> },
    { label: 'Avg Time Saved', value: analytics.averageTimeSaved, icon: <Clock className="text-routeBlue" size={20} /> },
    { label: 'Active Corridors', value: analytics.activeCorridors, icon: <ShieldCheck className="text-purple-400" size={20} /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {cards.map((c) => (
        <div key={c.label} className="glass-panel p-4 rounded-xl flex items-center justify-between transition-transform hover:-translate-y-1 hover:shadow-2xl">
          <div>
            <p className="text-xs text-textPrimary/60 font-medium uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">{c.value}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
