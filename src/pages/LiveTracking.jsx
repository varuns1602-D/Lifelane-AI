import MapView from '../components/MapView';
import { useSimulation } from '../context/useSimulation';
import { Gauge, Navigation, HeartPulse, MapPin } from 'lucide-react';

export default function LiveTracking() {
  const { ambulances } = useSimulation();
  const activeAmb = ambulances[0]; // Simulation: specific vehicle

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Details Panel */}
      <div className="w-full lg:w-96 glass-panel border-y-0 border-l-0 border-r border-white/10 flex flex-col z-10">
        <div className="p-6 border-b border-white/10">
           <div className="flex items-center gap-3 mb-1">
             <div className="w-3 h-3 rounded-full bg-corridorGreen animate-pulse shadow-[0_0_10px_#22c55e]"></div>
             <h2 className="text-2xl font-black tracking-tight">{activeAmb.id}</h2>
           </div>
           <p className="text-sm font-medium text-corridorGreen ml-6 uppercase tracking-widest">{activeAmb.status} EMERGENCY</p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
           {/* Telemetry */}
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <Gauge size={24} className="text-blue-400 mb-2" />
                <span className="text-xl font-bold">{activeAmb.speed} <span className="text-sm text-textPrimary/50 font-medium">mph</span></span>
                <span className="text-[10px] uppercase text-textPrimary/50 tracking-wider">Current Speed</span>
             </div>
             <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <ClockIcon size={24} className="text-routeYellow mb-2" />
                <span className="text-xl font-bold">{activeAmb.eta}</span>
                <span className="text-[10px] uppercase text-textPrimary/50 tracking-wider">Estimated Time</span>
             </div>
           </div>

           {/* Destination Info */}
           <div className="space-y-3">
             <h3 className="text-xs font-bold text-textPrimary/50 uppercase tracking-widest">Route Information</h3>
             <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg mt-0.5"><MapPin size={16} /></div>
                  <div>
                    <p className="text-xs text-textPrimary/50">Destination Hospital</p>
                    <p className="text-sm font-semibold">{activeAmb.destination}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-corridorGreen/20 text-corridorGreen p-2 rounded-lg mt-0.5"><Navigation size={16} /></div>
                  <div>
                    <p className="text-xs text-textPrimary/50">Signal Preemption</p>
                    <p className="text-sm font-semibold text-corridorGreen">Sequence Active</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-500/20 text-red-400 p-2 rounded-lg mt-0.5"><HeartPulse size={16} /></div>
                  <div>
                    <p className="text-xs text-textPrimary/50">Patient Status</p>
                    <p className="text-sm font-semibold">Critical - Trauma</p>
                  </div>
                </div>
             </div>
           </div>
        </div>

      </div>

      {/* Main Map View focused on ambulance */}
      <div className="flex-1 relative p-4">
        <div className="relative w-full h-full rounded-2xl overflow-hidden glass-panel border border-white/10 p-1">
          <MapView focusAmbulanceId={activeAmb.id} interactive={true} />
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
