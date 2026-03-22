/**
 * Utility for smooth coordinate interpolation and rotation calculation
 */

export const interpolatePosition = (p1, p2, progress) => {
  if (!p1 || !p2) return p1;
  // Progress should be between 0 and 1
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  return [
    p1[0] + (p2[0] - p1[0]) * safeProgress,
    p1[1] + (p2[1] - p1[1]) * safeProgress
  ];
};

export const calculateRotation = (p1, p2) => {
  if (!p1 || !p2) return 0;
  // Leaflet uses lat/lng [lat, lng]
  // In screen space (or math), y is lat, x is lng
  const dy = p2[0] - p1[0];
  const dx = p2[1] - p1[1];
  
  // atan2 returns angle in radians
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);
  return angle;
};

export const getIntersectionPredictor = (ambulance, signals, _timeThreshold = 10) => {
  if (!ambulance || !signals || ambulance.status !== 'Active') return null;
  
  // Basic prediction: find the nearest signal on the remaining route
  const remainingRoute = ambulance.routeCoordinates.slice(ambulance.routeStep);
  const nextSignal = signals.find(sig => {
    // Check if signal position is close to any point in remaining route
    return remainingRoute.some(coord => 
      Math.abs(coord[0] - sig.position[0]) < 0.0005 && 
      Math.abs(coord[1] - sig.position[1]) < 0.0005
    );
  });
  
  // For hackathon, we'll mock the "time to signal" based on route steps
  // (Assuming each routeStep is roughly 1-2 seconds of travel)
  // If nextSignal is within 5-8 steps, it's "approaching"
  return nextSignal;
};
