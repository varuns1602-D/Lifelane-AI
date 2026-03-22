import React from 'react';
import { useAuth } from '../context/useAuth';
import { ShieldCheck, History, Clock, FileText } from 'lucide-react';

export default function OfficerLogPanel() {
  const { activityLog } = useAuth();

  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden border border-white/10">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-corridorGreen" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">Officer Activity Log</h3>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
          <span className="text-[9px] font-mono text-white/40">Audit Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activityLog.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <History size={32} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-tighter">No recent activity detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityLog.map((log) => (
              <div key={log.id} className="relative pl-4 border-l border-white/10 py-1">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-corridorGreen shadow-[0_0_8px_#22c55e]"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-white/80 leading-tight">{log.action}</span>
                  <span className="text-[9px] font-mono text-white/30 whitespace-nowrap ml-4">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <FileText size={8} />
                  <span className="text-[9px] font-medium tracking-tight">Verified by {log.officer}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-black/40 border-t border-white/5 shrink-0">
         <p className="text-[9px] text-white/30 font-medium text-center italic tracking-tight">
           Session strictly monitored for accountability.
         </p>
      </div>
    </div>
  );
}
