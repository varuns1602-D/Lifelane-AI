import { calculateDistance } from './smoothAmbulanceMovement';

export const advanceAmbulances = (ambulances, signals) => {
  return ambulances.map(amb => {
    if (amb.isPaused || amb.status === 'Arrived') return amb;

    if (amb.routeStep < amb.routeCoordinates.length - 1) {
      const nextStepIndex = amb.routeStep + 1;
      const currentLoc = amb.routeCoordinates[nextStepIndex];
      const destinationLoc = amb.routeCoordinates[amb.routeCoordinates.length - 1];

      // Distance to hospital in KM
      const hospitalDist = calculateDistance(currentLoc, destinationLoc);
      
      // Progress calculation
      const progressPercent = Math.round((nextStepIndex / (amb.routeCoordinates.length - 1)) * 100);

      // ETA MM:SS Countdown
      const stepsRemaining = amb.routeCoordinates.length - nextStepIndex;
      const totalSeconds = stepsRemaining * 2; // Realism: 2 seconds per coordinate step
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const newEta = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      // Next Signal Logic
      const remainingRoute = amb.routeCoordinates.slice(nextStepIndex);
      const nextSignal = signals?.find(sig => {
        return remainingRoute.some(coord => 
          Math.abs(coord[0] - sig.position[0]) < 0.0008 && 
          Math.abs(coord[1] - sig.position[1]) < 0.0008
        );
      });

      // Speed variance
      const baseSpeed = amb.priority === 1 ? 75 : 55;
      const currentSpeed = baseSpeed + (Math.floor(Math.random() * 11) - 5);

      return {
        ...amb,
        routeStep: nextStepIndex,
        lastLocation: amb.currentLocation, 
        currentLocation: currentLoc,
        eta: newEta,
        speed: currentSpeed,
        hospitalDistance: hospitalDist.toFixed(2),
        progress: progressPercent,
        nextSignal: nextSignal ? nextSignal.id : 'N/A',
        isApproachingIntersection: hospitalDist < 0.2 // Trigger if < 200m
      };
    }

    if (amb.status !== 'Arrived' && amb.routeStep >= amb.routeCoordinates.length - 1) {
        return { ...amb, status: 'Arrived', eta: '00:00', speed: 0, progress: 100, hospitalDistance: 0 };
    }
    return amb;
  });
};
