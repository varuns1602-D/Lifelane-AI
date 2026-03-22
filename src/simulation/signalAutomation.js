// Helper: Get distance in degrees (approximate)
export const getDistance = (coord1, coord2) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
};

export const updateTrafficSignals = (signals, ambulances, forceOverride = false) => {
  return signals.map(sig => {
    if (forceOverride) {
      return { ...sig, status: 'green' }; // Global manual override
    }

    // Check if any active priority-1 ambulance is close
    const activeAmbs = ambulances.filter(amb => 
      amb.priority === 1 && 
      amb.status !== 'Arrived' && 
      !amb.isPaused
    );

    let status = 'red';
    activeAmbs.forEach(amb => {
      const dist = getDistance(amb.currentLocation, sig.position);
      if (dist < 0.003) status = 'green';
      else if (dist < 0.005 && status !== 'green') status = 'yellow';
    });
    
    return {
      ...sig,
      status: status
    };
  });
};
