import React from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function SecurityConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative glass-panel w-full max-w-sm overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-alertRed/10 rounded-lg text-alertRed">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          </div>
          
          <p className="text-sm text-white/60 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs font-bold transition-all border border-white/5 uppercase tracking-widest cursor-pointer"
            >
              Abrot
            </button>
            <button 
              onClick={onConfirm}
              className="flex-2 px-4 py-2 rounded-lg bg-alertRed hover:bg-red-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] uppercase tracking-widest cursor-pointer"
            >
              Confirm Authorization
            </button>
          </div>
        </div>
        
        <div className="bg-alertRed/5 p-3 flex items-center justify-center gap-2 border-t border-alertRed/10">
          <div className="w-1 h-1 rounded-full bg-alertRed animate-ping"></div>
          <span className="text-[9px] font-black text-alertRed uppercase tracking-[0.2em]">Police Intranet Authentication Needed</span>
        </div>
      </div>
    </div>
  );
}
