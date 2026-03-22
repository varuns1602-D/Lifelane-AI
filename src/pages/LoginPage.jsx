import { useNavigate } from 'react-router-dom';
import { Shield, Fingerprint, Activity, Building2, Navigation, Clock, CheckCircle2, AlertTriangle, Key, Mail } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useState, useEffect } from 'react';
import LeftPanel from '../components/LeftPanel';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginStep1, verifyOTP, isLoggedIn } = useAuth();
  
  const [stationId, setStationId] = useState('BLR-TC-001');
  const [officerId, setOfficerId] = useState('POL-7729');
  const [email, setEmail] = useState('officer@traffic.gov');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('OTP expired. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleStep1 = (e) => {
    e.preventDefault();
    const generated = loginStep1(stationId, officerId, email);
    if (generated) {
      setStep(2);
      setTimeLeft(60);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (verifyOTP(otp)) {
      navigate('/dashboard');
    } else {
      setError('Invalid verification code');
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative text-white">
      {/* City grid background */}
      <div className="absolute inset-0 bg-city-grid opacity-20 pointer-events-none" />

      {/* Left side: Smart Traffic Network Visualization */}
      <LeftPanel />

      {/* Right side: Login Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative z-10 w-full max-w-xl mx-auto backdrop-blur-sm lg:bg-transparent bg-panel/80">
        
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-corridorGreen to-blue-500 p-3 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Police<span className="text-corridorGreen">Control</span></h1>
              <p className="text-[10px] text-white/40 tracking-[0.3em] font-black uppercase">LifeLane Emergency Unit</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-corridorGreen/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {step === 1 ? 'Station Login' : 'Verify Identity'}
              </h2>
              <p className="text-sm text-textPrimary/50 flex items-center gap-2 mt-1">
                {step === 1 ? (
                  <> <Building2 size={12} /> Bangalore Traffic Control Hub</>
                ) : (
                  <> <Clock size={12} /> System generated OTP sent to device</>
                )}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-alertRed/10 border border-alertRed/20 text-alertRed text-xs font-medium flex items-center gap-2 transition-all">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-white/40 mb-1.5 uppercase tracking-widest">Police Station ID</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      value={stationId}
                      onChange={(e) => setStationId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-corridorGreen/50 focus:ring-1 focus:ring-corridorGreen/50 transition-all placeholder:text-white/10 font-mono" 
                      placeholder="e.g. BLR-TC-001"
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 mb-1.5 uppercase tracking-widest">Officer Badge ID</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-corridorGreen/50 focus:ring-1 focus:ring-corridorGreen/50 transition-all placeholder:text-white/10 font-mono" 
                      placeholder="e.g. POL-7729"
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 mb-1.5 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-corridorGreen/50 focus:ring-1 focus:ring-corridorGreen/50 transition-all placeholder:text-white/10 font-mono" 
                      placeholder="officer@traffic.gov"
                      required 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full group relative flex justify-center items-center gap-2 bg-corridorGreen hover:bg-green-400 text-green-950 font-black uppercase tracking-widest text-xs rounded-lg px-4 py-4 transition-all cursor-pointer shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-pulse hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                  >
                    Authenticate Credentials
                    <Navigation size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="space-y-6">
                <div className="flex flex-col items-center">
                  <label className="block text-[10px] font-black text-white/40 mb-4 uppercase tracking-[0.2em]">6-Digit Security Code</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-corridorGreen focus:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all" 
                    placeholder="000000"
                    autoFocus
                    required 
                  />
                  <div className="mt-6 flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Time Remaining</span>
                    <span className={`text-sm font-mono font-bold ${timeLeft < 10 ? 'text-alertRed animate-pulse' : 'text-corridorGreen'}`}>
                      00:{timeLeft.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    type="submit" 
                    disabled={timeLeft === 0}
                    className="w-full relative flex justify-center items-center gap-2 bg-corridorGreen hover:bg-green-400 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-green-950 font-black uppercase tracking-widest text-xs rounded-lg px-4 py-4 transition-all shadow-[0_0_25px_rgba(34,197,94,0.3)]"
                  >
                    <CheckCircle2 size={16} /> 
                    Verify & Unlock Dashboard
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-full text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors py-2"
                  >
                    Back to credentials
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-tighter">
              <Key size={10} /> RSA-4096 Encrypted
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-tighter">
              <Shield size={10} /> Police Intranet
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
