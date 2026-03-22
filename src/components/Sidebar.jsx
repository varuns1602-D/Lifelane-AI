import { useState } from 'react';
import { useSimulation } from '../context/useSimulation';
import { ShieldAlert, Info, AlertTriangle, AlertCircle, Play, Pause, Hand, Radio, Activity, Gauge, Zap, RotateCcw } from 'lucide-react';
import AlertPanel from './AlertPanel';
import OfficerLogPanel from './OfficerLogPanel';
import SecurityConfirmModal from './SecurityConfirmModal';

export default function Sidebar({ className = '' }) {
  const { 
    ambulances, 
    alerts, 
    prioritizeAmbulance, 
    overrideSignals,
    resetSimulation,
    focusedAmbulanceId,
    setFocusedAmbulanceId,
    trafficLoad
  } = useSimulation();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleOverrideRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirmOverride = () => {
    overrideSignals();
    setShowConfirm(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return 'text-corridorGreen bg-corridorGreen/10 border-corridorGreen/30';
      case 2: return 'text-routeYellow bg-routeYellow/10 border-routeYellow/30';
      case 3: return 'text-routeBlue bg-routeBlue/10 border-routeBlue/30';
      default: return 'text-textPrimary bg-panel border-white/10';
    }
  };

  // No longer needed here as handled by AlertPanel
  // const recentAlerts = alerts.slice(0, 10);

  return (
    <>
    <aside className={`glass-panel border-y-0 border-l-0 border-r border-white/10 flex-col overflow-y-auto ${className}`}>
      <div className="p-5">
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Traffic Load</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${trafficLoad === 'Low' ? 'text-corridorGreen bg-corridorGreen/10' : trafficLoad === 'Medium' ? 'text-routeYellow bg-routeYellow/10' : 'text-alertRed bg-alertRed/10'}`}>
              {trafficLoad}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${trafficLoad === 'Low' ? 'bg-corridorGreen w-1/3' : trafficLoad === 'Medium' ? 'bg-routeYellow w-2/3' : 'bg-alertRed w-full'}`}
            ></div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
             <Radio size={14} className="text-corridorGreen" />
             Active Emergencies
          </h3>
          <div className="space-y-3">
            {ambulances.map(amb => (
              <div 
                key={amb.id} 
                onClick={() => setFocusedAmbulanceId(amb.id)}
                className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-300 hover:bg-white/5 cursor-pointer group ${focusedAmbulanceId === amb.id ? 'ring-2 ring-corridorGreen/40 bg-white/5 scale-[1.02]' : 'bg-white/[0.02] border-white/5'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-corridorGreen transition-colors">{amb.id}</h4>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Emergency Unit</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getPriorityColor(amb.priority)}`}>
                    Priority {amb.priority}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pb-3 border-b border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">ETA</span>
                    <span className="text-xs font-mono font-bold text-white/90">{amb.eta}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${
                      amb.status === 'Arrived' ? 'text-corridorGreen' : 
                      amb.status === 'Active' ? 'text-routeBlue' : 
                      amb.status === 'Emergency' ? 'text-alertRed' : 'text-routeYellow'
                    }`}>
                      {amb.status === 'Active' ? '• Active' : 
                       amb.status === 'Arrived' ? '✓ Arrived' : 
                       amb.status === 'Emergency' ? '⚠ Emergency' : '» En Route'}
                    </span>
                  </div>
                </div>

                {amb.isApproachingIntersection && amb.status === 'Active' && (
                  <div className="mt-3 flex items-center gap-2 animate-pulse bg-corridorGreen/10 p-2 rounded-lg border border-corridorGreen/20">
                    <Zap size={10} className="text-corridorGreen" />
                    <span className="text-[9px] font-black uppercase text-corridorGreen tracking-widest">Approaching Intersection</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-white/90">Quick Controls</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { 
                const target = focusedAmbulanceId || ambulances[0]?.id;
                if(target) prioritizeAmbulance(target) 
              }}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-panel hover:bg-white/10 border border-white/5 transition-colors gap-2 text-xs font-medium cursor-pointer"
            >
              <Play size={18} className="text-corridorGreen" />
              Prioritize {focusedAmbulanceId ? focusedAmbulanceId : (ambulances[0]?.id || '')}
            </button>
            <button 
              onClick={handleOverrideRequest}
              className="col-span-2 flex items-center justify-center p-3 rounded-lg bg-alertRed/10 hover:bg-alertRed/20 border border-alertRed/30 text-alertRed transition-colors gap-2 text-xs font-medium mt-1 cursor-pointer"
            >
              <Hand size={18} />
              Emergency Override Signal
            </button>
            <button 
              onClick={resetSimulation}
              className="col-span-2 flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 transition-colors gap-2 text-[10px] font-black uppercase tracking-widest mt-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Simulated Fleet
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white/90">System Alerts</h3>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Latest 8 Events</span>
          </div>
          <AlertPanel alerts={alerts} limit={8} variant="sidebar" />
        </div>

        <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
          <OfficerLogPanel />
        </div>
      </div>
    </aside>

    <SecurityConfirmModal 
      isOpen={showConfirm}
      onConfirm={handleConfirmOverride}
      onCancel={() => setShowConfirm(false)}
      title="Critical Signal Override"
      message="This action will force all signals to green. This is a restricted emergency maneuver and will be logged to your badge."
    />
    </>
  );
}
