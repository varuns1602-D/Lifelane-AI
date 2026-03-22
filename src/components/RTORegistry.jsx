import { useState } from 'react';
import { useSimulation } from '../context/useSimulation';
import { PlusCircle, Database, CheckCircle2 } from 'lucide-react';

export default function RTORegistry() {
  const { hospitals, registerVehicle } = useSimulation();
  const [regNumber, setRegNumber] = useState('');
  const [hospital, setHospital] = useState(hospitals[0]?.name || '');
  const [vehicleType, setVehicleType] = useState('Ambulance');
  const [statusMsg, setStatusMsg] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regNumber || !hospital) return;

    // Call Context Function
    registerVehicle(regNumber, hospital, vehicleType);
    
    setStatusMsg(`Success! ${regNumber} has been tracked.`);
    setRegNumber('');
    
    // Clear success message after 3 seconds
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-32 h-32 bg-routeBlue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-routeBlue/20 text-routeBlue p-2 rounded-lg">
           <Database size={20} />
        </div>
        <div>
           <h3 className="text-lg font-bold">RTO Registry</h3>
           <p className="text-xs text-textPrimary/50">Register emergency vehicles to tracking system</p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end relative z-10 w-full mt-2">
        <div>
           <label className="block text-[10px] font-bold text-textPrimary/50 uppercase tracking-wider mb-1.5">Registration Base</label>
           <input 
             type="text" 
             value={regNumber}
             onChange={e => setRegNumber(e.target.value)}
             className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-routeBlue/50 transition-colors" 
             placeholder="e.g. KA01XX9999"
             required 
           />
        </div>

        <div>
           <label className="block text-[10px] font-bold text-textPrimary/50 uppercase tracking-wider mb-1.5">Assigned Hospital</label>
           <select 
             value={hospital}
             onChange={e => setHospital(e.target.value)}
             className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-routeBlue/50 transition-colors text-white"
           >
             {hospitals.map(h => (
               <option key={h.id} value={h.name} className="bg-panel">{h.name}</option>
             ))}
           </select>
        </div>

        <div>
           <label className="block text-[10px] font-bold text-textPrimary/50 uppercase tracking-wider mb-1.5">Vehicle Classification</label>
           <select 
             value={vehicleType}
             onChange={e => setVehicleType(e.target.value)}
             className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-routeBlue/50 transition-colors text-white"
           >
             <option value="Ambulance" className="bg-panel">Advanced Life Support</option>
             <option value="Transit" className="bg-panel">Basic Transit</option>
             <option value="Fire" className="bg-panel">Fire Rescue</option>
           </select>
        </div>

        <div>
           <button 
             type="submit" 
             className="w-full flex justify-center items-center gap-2 bg-routeBlue hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
           >
             <PlusCircle size={16} />
             Register
           </button>
        </div>
      </form>

      {statusMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-corridorGreen animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={14} />
          {statusMsg}
        </div>
      )}
    </div>
  );
}
