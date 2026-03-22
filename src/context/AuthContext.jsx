import React, { useState } from 'react';
import { AuthContext } from './useAuth';
import { authorizedVehicles } from '../mockData';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('lifelane_auth') === 'true';
  });

  const [isOTPVerified, setIsOTPVerified] = useState(() => {
    return localStorage.getItem('lifelane_otp_verified') === 'true';
  });

  const [officer, setOfficer] = useState(() => {
    const saved = localStorage.getItem('lifelane_officer');
    return saved ? JSON.parse(saved) : null;
  });

  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem('lifelane_activity');
    return saved ? JSON.parse(saved) : [];
  });

  const [generatedOTP, setGeneratedOTP] = useState(null);

  const loginStep1 = (stationId, officerId, email) => {
    if (stationId.trim() && officerId.trim() && email.trim()) {
      // Create mock officer name
      const officerName = officerId.includes('7729') ? 'Officer 01' : `Officer-${officerId.slice(-4)}`;
      const profile = { name: officerName, stationId, officerId, email, stationName: 'Bangalore Traffic Control' };
      
      setOfficer(profile);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      
      console.log('--- SYSTEM AUTH ---');
      console.log(`STATION: ${stationId}`);
      console.log(`OFFICER: ${officerId}`);
      console.log(`VERIFICATION CODE: ${otp}`);
      console.log('-------------------');
      
      localStorage.setItem('lifelane_officer', JSON.stringify(profile));
      return otp;
    }
    return null;
  };

  const verifyVehicle = (vehicleId, driverId) => {
    const vehicle = authorizedVehicles.find(v => v.vehicleId === vehicleId && v.driverId === driverId);
    if (vehicle && vehicle.status === 'verified') {
      logAction(`VAC System: Vehicle ${vehicleId} verified for Driver ${driverId}`);
      return true;
    }
    logAction(`VAC ALERT: Unauthorized access attempt by ${vehicleId}`);
    return false;
  };

  const verifyOTP = (code) => {
    if (code === generatedOTP || code === '000000') { // 000000 for emergency dev backdoor
      setIsLoggedIn(true);
      setIsOTPVerified(true);
      localStorage.setItem('lifelane_auth', 'true');
      localStorage.setItem('lifelane_otp_verified', 'true');
      logAction('Security Authentication Successful');
      return true;
    }
    return false;
  };

  const logAction = (action) => {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      timestamp: new Date().toLocaleTimeString(),
      officer: officer?.officerId || 'System'
    };
    setActivityLog(prev => {
      const newLog = [entry, ...prev].slice(0, 50);
      localStorage.setItem('lifelane_activity', JSON.stringify(newLog));
      return newLog;
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsOTPVerified(false);
    setOfficer(null);
    setActivityLog([]);
    setGeneratedOTP(null);
    localStorage.removeItem('lifelane_auth');
    localStorage.removeItem('lifelane_otp_verified');
    localStorage.removeItem('lifelane_officer');
    localStorage.removeItem('lifelane_activity');
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: isLoggedIn && isOTPVerified, 
      isOTPVerified,
      officer, 
      activityLog,
      loginStep1, 
      verifyOTP, 
      logout,
      logAction,
      verifyVehicle
    }}>
      {children}
    </AuthContext.Provider>
  );
}
