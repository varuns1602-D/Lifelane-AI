import React from 'react';
import { useSimulation } from '../context/useSimulation';
import { Gauge, Clock, Navigation, MapPin, Activity, Zap } from 'lucide-react';

export default function LiveTrackingPanel() {
  const { ambulances, focusedAmbulanceId } = useSimulation();
  
  const activeAmbs = ambulances.filter(a => a.status === 'Active');
  const focusedAmb = ambulances.find(a => a.id === focusedAmbulanceId) || activeAmbs[0];

  if (!focusedAmb) return (
    <div className="w-80 h-full p-6 flex flex-col items-center justify-center text-white/40 glass-panel border-l border-white/10">
      <Activity size={48} className="mb-4 opacity-20" />
      <p className="text-sm font-medium">No live telemetry detected</p>
    </div>
  );

  return (
    <div className="w-80 h-full flex flex-col glass-panel border-l border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-gradient-to-br from-corridorGreen/5 to-transparent">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{focusedAmb.id}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-corridorGreen animate-pulse"></div>
              <span className="text-[10px] font-bold text-corridorGreen uppercase tracking-widest leading-none">Live Telemetry</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${focusedAmb.priority === 1 ? 'border-corridorGreen/50 text-corridorGreen bg-corridorGreen/10' : 'border-white/20 text-white/60 bg-white/5'}`}>
            P{focusedAmb.priority}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter flex items-center gap-1">
                <Gauge size={10} /> Speed
              </span>
              <span className="text-lg font-mono font-bold text-white">{focusedAmb.speed} <span className="text-[10px] font-sans font-medium opacity-40">km/h</span></span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter flex items-center gap-1">
                <Clock size={10} /> Arrival
              </span>
              <span className="text-lg font-mono font-bold text-corridorGreen">T-{focusedAmb.eta}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h4 className="text-[10px] font-black text-white/30 tracking-[.2em] uppercase mb-4">Route Intelligence</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                <Navigation size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/40 font-bold uppercase leading-tight">Destination</p>
                <p className="text-sm text-white font-medium truncate">{focusedAmb.destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                <MapPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/40 font-bold uppercase leading-tight">Next Signal</p>
                <p className="text-sm text-white font-medium">{focusedAmb.nextSignal || 'Detecting...'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Corridor Cleared</span>
             <span className="text-xs font-mono font-bold text-corridorGreen">{focusedAmb.progress}% Progress</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-corridorGreen transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              style={{ width: `${focusedAmb.progress}%` }}
            ></div>
          </div>
          <p className="mt-3 text-[10px] text-white/40 font-medium">
             {focusedAmb.progress}% corridor cleared path to hospital destination.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-corridorGreen/5 border border-corridorGreen/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-corridorGreen" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Advanced Priority</span>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed">
            AI-driven corridor optimization is clearing signals 300m ahead of current position.
          </p>
        </div>
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${focusedAmb.id}`} alt="Driver" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white font-bold leading-none">Emergency Unit</p>
            <p className="text-[10px] text-white/40 font-medium mt-1">Disp-B-102 Bangalore</p>
          </div>
        </div>
      </div>
    </div>
  );
}
