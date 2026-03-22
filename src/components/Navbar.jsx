import { Ambulance, Activity, Map, LayoutDashboard, BarChart3 } from 'lucide-react';
import { Bell, Search, Settings, ShieldCheck, MapPin, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useSimulation } from '../context/useSimulation';

export default function Navbar() {
  const { logout, officer } = useAuth();
  const { systemStatus } = useSimulation();

  const handleLogout = () => {
    logout();
  };

  const getStatusDisplay = () => {
    if (systemStatus === 'online') {
       return { color: 'bg-corridorGreen', text: 'System Online', border: 'border-corridorGreen/30' };
    }
    if (systemStatus === 'maintenance') {
       return { color: 'bg-routeYellow', text: 'Maintenance', border: 'border-routeYellow/30' };
    }
    return { color: 'bg-alertRed', text: 'System Offline', border: 'border-alertRed/30' };
  };

  const statusDisplay = getStatusDisplay();
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: 'Live Tracking', icon: <Map size={18} />, path: '/live-tracking' },
    { label: 'Alerts', icon: <Bell size={18} />, path: '/alerts' },
    { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics' },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 rounded-none border-t-0 border-x-0 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="bg-corridorGreen/20 p-2 rounded-lg text-corridorGreen">
          <Ambulance size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">LifeLane AI</h1>
          <p className="text-xs text-textPrimary/70 font-medium tracking-wider">SMART CITY EMERGENCY CONTROL</p>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-1 bg-panel/50 p-1 rounded-xl border border-white/5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-corridorGreen/20 text-corridorGreen shadow-inner' 
                  : 'text-textPrimary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/5 ${statusDisplay.border}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusDisplay.color}`}></div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">{statusDisplay.text}</span>
        </div>
        
        <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-corridorGreen to-blue-500 p-0.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            <div className="w-full h-full bg-panel rounded-full flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${officer?.officerId || 'OP'}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight text-white">{officer?.name || 'Authorized Personnel'}</p>
            <p className="text-[10px] text-corridorGreen font-mono font-bold tracking-tighter">{officer?.officerId || 'ID: UNKNOWN'}</p>
          </div>
          <button onClick={handleLogout} className="ml-2 hover:bg-alertRed/10 p-2 text-alertRed/80 hover:text-alertRed rounded-lg transition-colors border border-transparent hover:border-alertRed/30 cursor-pointer" title="Secure Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
