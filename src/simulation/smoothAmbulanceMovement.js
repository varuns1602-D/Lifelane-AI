/**
 * High-performance coordinate interpolation for 60fps movement
 */

export const interpolatePosition = (p1, p2, progress) => {
  if (!p1 || !p2) return p1;
  // Progress should be between 0 and 1, clamped to avoid jumps
  const safeProgress = Math.min(Math.max(progress, 0), 0.999);
  return [
    p1[0] + (p2[0] - p1[0]) * safeProgress,
    p1[1] + (p2[1] - p1[1]) * safeProgress
  ];
};

export const calculateRotation = (p1, p2) => {
  if (!p1 || !p2) return 0;
  // Leaflet uses [lat, lng]
  const dy = p2[0] - p1[0];
  const dx = p2[1] - p1[1];
  
  // atan2(dx, dy) for rotation from North (Leaflet/Map typical)
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);
  return angle;
};

/**
 * Calculate distance between two points in KM (Haversine approx for small distances)
 */
export const calculateDistance = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const R = 6371; // Radius of earth in KM
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
