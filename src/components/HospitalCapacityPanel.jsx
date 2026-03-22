import React from 'react';
import { mockHospitals } from '../mockData';
import { Activity, Bed, Thermometer, MapPin } from 'lucide-react';

export default function HospitalCapacityPanel() {
  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden border border-white/10 bg-panel/40">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-corridorGreen" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Hospital Readiness</h3>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-corridorGreen/20 border border-corridorGreen/30">
          <span className="text-[9px] font-mono text-corridorGreen font-bold">LIVE NETWORK</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {mockHospitals.map((hospital) => (
          <div key={hospital.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-xs font-bold text-white">{hospital.name}</h4>
                <div className="flex items-center gap-1 opacity-40 mt-0.5">
                  <MapPin size={8} />
                  <span className="text-[9px] font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    Authorized Medical Center
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-corridorGreen animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 rounded-lg p-2 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                   <Bed size={12} />
                 </div>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Emergency</p>
                 <div className="flex items-baseline gap-1">
                   <span className="text-lg font-mono font-bold text-white">{hospital.capacity?.emergencyBeds || 0}</span>
                   <span className="text-[10px] text-white/40">Beds</span>
                 </div>
              </div>
              <div className="bg-black/40 rounded-lg p-2 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                   <Thermometer size={12} />
                 </div>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">ICU</p>
                 <div className="flex items-baseline gap-1">
                   <span className="text-lg font-mono font-bold text-corridorGreen">{hospital.capacity?.icuAvailable || 0}</span>
                   <span className="text-[10px] text-white/40">Open</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-black/60 border-t border-white/5 shrink-0 flex items-center justify-center gap-2">
         <span className="w-1 h-1 rounded-full bg-corridorGreen"></span>
         <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Global Network Integrity Verified</p>
      </div>
    </div>
  );
}
