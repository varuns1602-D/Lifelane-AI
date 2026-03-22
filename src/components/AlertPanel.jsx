import React from 'react';
import { ShieldAlert, Info, AlertTriangle, AlertCircle, Activity, Hospital, Radio, Zap } from 'lucide-react';

export default function AlertPanel({ alerts = [], limit = 8, variant = 'full' }) {
  const getAlertIcon = (type) => {
    switch(type) {
      case 'info': return <Info size={16} className="text-routeBlue" />;
      case 'success': return <ShieldAlert size={16} className="text-corridorGreen" />;
      case 'warning': return <AlertTriangle size={16} className="text-routeYellow" />;
      case 'hospital': return <Hospital size={16} className="text-corridorGreen" />;
      case 'signal': return <Zap size={16} className="text-routeBlue animate-pulse" />;
      case 'ambulance': return <Activity size={16} className="text-alertRed" />;
      default: return <AlertCircle size={16} className="text-alertRed" />;
    }
  };

  const getAlertStyle = (type) => {
    if (variant === 'sidebar') return '';
    switch(type) {
      case 'info': return 'border-routeBlue/20 bg-routeBlue/5 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]';
      case 'success': case 'hospital': return 'border-corridorGreen/20 bg-corridorGreen/5 shadow-[inset_0_0_10px_rgba(34,197,94,0.05)]';
      case 'warning': return 'border-routeYellow/20 bg-routeYellow/5 shadow-[inset_0_0_10px_rgba(234,179,8,0.05)]';
      case 'signal': return 'border-routeBlue/30 bg-routeBlue/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      default: return 'border-alertRed/20 bg-alertRed/5 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]';
    }
  };

  const displayedAlerts = alerts.slice(0, limit);

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-white/5">
        {displayedAlerts.map(alert => (
          <div key={`${alert.id}-${alert.text?.slice(0, 20)}`} className="relative pl-8 pr-2 transition-all hover:bg-white/5 py-1 rounded-md">
            <div className={`absolute left-[8px] top-1.5 -ml-[3px] bg-panel rounded-full p-1 border border-white/10 ${alert.type === 'signal' ? 'shadow-[0_0_8px_#3b82f6]' : ''}`}>
              {getAlertIcon(alert.type)}
            </div>
            <p className="text-[11px] text-textPrimary/90 leading-tight font-medium">{alert.text}</p>
            <span className="text-[9px] text-textPrimary/40 font-mono mt-0.5 block uppercase tracking-tighter">{alert.time} • LOG {100 + (Number(String(alert.id).replace(/\D/g,'').slice(-3)) || 0) % 900}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedAlerts.map(alert => (
        <div key={`${alert.id}-${alert.text?.slice(0, 20)}`} className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl transition-all hover:translate-x-1 ${getAlertStyle(alert.type)}`}>
          <div className="bg-panel p-2.5 rounded-xl border border-white/10 flex-shrink-0 shadow-2xl mt-0.5">
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
               <h3 className="text-sm font-bold text-white tracking-wide truncate">{alert.text}</h3>
               <span className="text-[10px] font-mono text-textPrimary/40 bg-black/40 px-2 py-0.5 rounded border border-white/5 shrink-0 uppercase tracking-widest">{alert.time}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className={`w-1.5 h-1.5 rounded-full ${alert.type === 'hospital' ? 'bg-corridorGreen' : alert.type === 'warning' ? 'bg-routeYellow' : 'bg-routeBlue'} animate-pulse`}></div>
               <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest">
                {alert.type === 'hospital' ? 'Facility Response Ready' :
                 alert.type === 'warning' ? 'Operator Attention Required' :
                 alert.type === 'signal' ? 'Intersection Automation Engaged' :
                 'System Protocol Initialized'}
               </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
