export const recalculateMetrics = (ambulances, signals, prevAnalytics) => {
  const activeAmbs = ambulances.filter(a => a.status === 'Active' && !a.isPaused);
  
  // Count active emergencies (moving)
  const activeEmergencies = activeAmbs.length;
  
  // Count active Corridors (Priority 1 green routes)
  const activeCorridors = activeAmbs.filter(a => a.priority === 1).length;

  // Count green signals
  const signalsControlled = signals.filter(s => s.status === 'green').length;

  // Dynamic Avg Time Saved calculation based on performance
  // Base 8.5 but varies slightly based on active corridors vs active signals
  const baseTimeSaved = 8.5;
  const variance = activeCorridors * 0.5 + (signalsControlled * 0.1);
  const avgTimeSaved = `${(baseTimeSaved + variance).toFixed(1)} mins`;

  return {
    ...prevAnalytics,
    activeEmergencies,
    activeCorridors,
    signalsControlled,
    averageTimeSaved: avgTimeSaved
  };
};
