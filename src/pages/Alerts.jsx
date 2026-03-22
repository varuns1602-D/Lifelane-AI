import { useSimulation } from '../context/useSimulation';
import { ShieldAlert, Info, AlertTriangle, AlertCircle, Trash2, SlidersHorizontal } from 'lucide-react';

import AlertPanel from '../components/AlertPanel';

export default function Alerts() {
  const { alerts } = useSimulation();

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-textPrimary/50 mt-1">Real-time command center notifications and warnings.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 bg-panel hover:bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
             <SlidersHorizontal size={16} /> Filter
           </button>
           <button className="flex items-center gap-2 text-textPrimary/50 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition-colors">
             <Trash2 size={16} /> Clear All
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12 pr-4">
        <AlertPanel alerts={alerts} limit={20} variant="full" />
        
        {!alerts.length && (
          <div className="flex flex-col items-center justify-center h-64 opacity-30 text-center">
            <Info size={48} className="mb-4" />
            <p className="text-xl font-semibold">No active alerts recorded</p>
            <p className="text-sm">Command center is currently clear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
