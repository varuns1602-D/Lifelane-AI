import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../context/useSimulation';
import { interpolatePosition, calculateRotation } from '../simulation/smoothAmbulanceMovement';
import { isSupabaseReady } from '../services/databaseService';

// MapTiler API Key
const MAPTILER_KEY = 'orUkDJaRfHSjJBqy7Qvr';

// Custom Icons
const createIcon = (color, type, rotation = 0) => {
  const iconHtml = type === 'amb' 
    ? `<div class="amb-marker relative w-10 h-10 transition-transform duration-100" style="transform: rotate(${rotation}deg);">
        <div class="absolute inset-0 rounded-full border-2 border-white/50 shadow-[0_0_20px_${color}] flex items-center justify-center animate-pulse" style="background-color: ${color};">
          <span class="text-white text-lg">🚑</span>
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white/80"></div>
        </div>
       </div>`
    : `<div class="w-8 h-8 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center transition-all duration-300 ${type === 'signal' ? 'signal-glow' : ''}" style="background-color: ${color}; box-shadow: ${type === 'signal' && color !== '#ef4444' ? `0 0 15px ${color}` : 'none'}">
        <span class="text-white text-xs font-bold">${type === 'hosp' ? '🏥' : '🚦'}</span>
       </div>`;

  return new L.DivIcon({
    className: 'bg-transparent',
    html: iconHtml,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const getSignalIcon = (status) => {
  if (status === 'green') return createIcon('#22c55e', 'signal');
  if (status === 'red') return createIcon('#ef4444', 'signal');
  return createIcon('#eab308', 'signal');
};

// Component that handles 60fps animation loop for markers
function AnimationEngine({ ambulances, signals, autoTrack, activeFocusId, setSignalStatus, prioritizeAmbulance, focusedAmbulanceId, manualOverrides }) {
  const map = useMap();
  const markerRefs = useRef({});
  const polylineRefs = useRef({});
  const requestRef = useRef();
  const animateRef = useRef(null);
  const isSupabase = React.useMemo(() => {
    try { return isSupabaseReady(); } catch(e) { return false; }
  }, []);

  useEffect(() => {
    animateRef.current = () => {
      const now = Date.now();

      ambulances.forEach(amb => {
        const marker = markerRefs.current[amb.id];
        const polyline = polylineRefs.current[amb.id];
        
        if (marker && amb.status === 'Active' && !amb.isPaused && amb.lastLocation) {
          // Calculate progress per ambulance based on its last update time
          // Default to 1s for simulation, 2s for Supabase live updates
          const duration = isSupabase ? 2000 : 1000;
          const updateAge = now - (amb.lastUpdateTime || now);
          const progress = Math.min(updateAge / duration, 0.99);

          const currentPos = interpolatePosition(amb.lastLocation, amb.currentLocation, progress);
          const rotation = calculateRotation(amb.lastLocation, amb.currentLocation);
          
          marker.setLatLng(currentPos);
          const iconElement = marker.getElement()?.querySelector('.amb-marker');
          if (iconElement) {
            iconElement.style.transform = `rotate(${rotation}deg)`;
          }

          if (autoTrack && (amb.id === activeFocusId || (!activeFocusId && amb.priority === 1))) {
             map.panTo(currentPos, { animate: false });
          }
        }

        if (polyline) {
          const isPriority = amb.priority === 1;
          if (isPriority) {
            polyline.setStyle({
              dashArray: '10, 15',
              dashOffset: -(now / 20) % 25
            });
          }
        }
      });

      requestRef.current = requestAnimationFrame(() => animateRef.current?.());
    };
  }, [ambulances, autoTrack, activeFocusId, map, isSupabase]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(() => animateRef.current?.());
    return () => cancelAnimationFrame(requestRef.current);
  }, [autoTrack, activeFocusId]);

  return (
    <>
      {ambulances.map(amb => (
        <React.Fragment key={amb.id}>
          <Polyline 
            ref={el => polylineRefs.current[amb.id] = el}
            positions={amb.routeCoordinates} 
            color={
              amb.routeType === 'green' ? '#22c55e' : 
              amb.routeType === 'yellow' ? '#eab308' : 
              amb.routeType === 'red' ? '#ef4444' : '#94a3b8'
            } 
            weight={amb.priority === 1 ? 8 : 4}
            opacity={amb.priority === 1 ? 0.8 : 0.4}
            className={amb.priority === 1 ? 'corridor-pulse' : ''}
          />
          <Marker 
            ref={el => markerRefs.current[amb.id] = el}
            position={amb.currentLocation} 
            icon={createIcon(
              amb.routeType === 'green' ? '#22c55e' : 
              amb.routeType === 'yellow' ? '#eab308' : 
              amb.routeType === 'red' ? '#ef4444' : '#94a3b8', 
              'amb'
            )}
          >
            <Popup>
               <div className="font-sans min-w-[120px]">
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-lg text-white">{amb.id}</strong>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${amb.priority === 1 ? 'bg-corridorGreen/20 text-corridorGreen' : 'bg-white/10 text-white/60'}`}>P{amb.priority}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/40 uppercase font-black">Velocity</span>
                    <span className="text-xs font-mono font-bold text-white">{amb.speed || 0} KM/H</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/40 uppercase font-black">Arrival</span>
                    <span className="text-xs font-mono font-bold text-corridorGreen">T-{amb.eta}</span>
                  </div>
                </div>
               </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
      {signals.map(sig => (
        <Marker 
          key={sig.id}
          position={sig.position} 
          icon={getSignalIcon(sig.status)}
          eventHandlers={{
            click: () => handleSignalClick(sig)
          }}
        >
          <Popup className="signal-popup border-none">
            <div className="p-3 bg-[#0f172a] min-w-[180px] rounded-xl border border-white/10 shadow-2xl text-white font-sans">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Signal Hub</h3>
                  <p className="text-xs font-bold text-white">{sig.id}</p>
                </div>
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${sig.status === 'green' ? 'bg-[#22c55e] shadow-[#22c55e]' : 'bg-[#ef4444] shadow-[#ef4444]'}`}></div>
              </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Manual Override</span>
                      {manualOverrides[sig.id] && (
                        <span className="text-[8px] bg-routeYellow/20 text-routeYellow px-1.5 py-0.5 rounded font-black animate-pulse">TIMED ACTIVE</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSignalStatus(sig.id, 'green'); }}
                            className="px-2 py-2 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[9px] font-black uppercase tracking-tighter hover:bg-[#22c55e]/20 transition-all cursor-pointer"
                          >
                            Turn Green
                          </button>
                          <div className="flex gap-1">
                            {[1, 5].map(m => (
                              <button 
                                key={m}
                                onClick={(e) => { e.stopPropagation(); setSignalStatus(sig.id, 'green', m); }}
                                className="flex-1 py-1 rounded bg-[#22c55e]/5 border border-[#22c55e]/10 text-[#22c55e] text-[8px] font-bold hover:bg-[#22c55e]/20"
                              >
                                {m}m
                              </button>
                            ))}
                          </div>
                       </div>
                       <div className="flex flex-col gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSignalStatus(sig.id, 'red'); }}
                            className="px-2 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[9px] font-black uppercase tracking-tighter hover:bg-[#ef4444]/20 transition-all cursor-pointer"
                          >
                            Turn Red
                          </button>
                          <div className="flex gap-1">
                            {[1, 5].map(m => (
                              <button 
                                key={m}
                                onClick={(e) => { e.stopPropagation(); setSignalStatus(sig.id, 'red', m); }}
                                className="flex-1 py-1 rounded bg-[#ef4444]/5 border border-[#ef4444]/10 text-[#ef4444] text-[8px] font-bold hover:bg-[#ef4444]/20"
                              >
                                {m}m
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prioritizeAmbulance(focusedAmbulanceId || ambulances.find(a => a.priority === 1)?.id || ambulances[0].id); }}
                    className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Activate Priority
                  </button>
                </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function MapView({ focusAmbulanceId = null, interactive = true }) {
  const { 
    ambulances, 
    signals, 
    hospitals,
    focusedAmbulanceId: contextFocusId,
    setSignalStatus,
    prioritizeAmbulance,
    manualOverrides
  } = useSimulation();

  const [autoTrack] = useState(true);
  const activeFocusId = contextFocusId || focusAmbulanceId;

  return (
    <div className="map-container relative h-full w-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none flex flex-col items-center gap-3">
        {/* Improved Live Optimization Panel */}
        <div className="bg-black/80 backdrop-blur-xl px-6 py-2 rounded-full border border-corridorGreen/50 shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-4 transition-all duration-500 hover:scale-105 active:scale-95">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-corridorGreen animate-ping"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-corridorGreen shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Live Optimization</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-xs font-bold text-corridorGreen leading-none tracking-tight">Smart City AI Enabled</span>
        </div>

        {/* New Corridor Status Bar */}
        {ambulances.some(a => a.priority === 1 && a.status === 'Active') && (
          <div className="bg-black/60 backdrop-blur-lg border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 min-w-[300px] animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between w-full items-center">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">Corridor Clearance</span>
              <span className="text-[10px] font-mono font-bold text-corridorGreen">
                {ambulances.find(a => a.priority === 1)?.progress || 0}% Cleared
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-corridorGreen transition-all duration-1000 shadow-[0_0_10px_#22c55e]"
                style={{ width: `${ambulances.find(a => a.priority === 1)?.progress || 0}%` }}
              ></div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/60">
                 <div className="w-1.5 h-1.5 rounded-full bg-corridorGreen"></div>
                 Signals Cleared: {signals.filter(s => s.status === 'green').length}
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <div className="text-[9px] font-bold text-white/60">
                 Status: <span className="text-corridorGreen uppercase font-black">Optimal</span>
              </div>
            </div>
          </div>
        )}
      </div>


      <MapContainer 
        center={[12.9550, 77.6000]} 
        zoom={13} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        className="w-full h-full rounded-2xl z-0"
        style={{ height: '100%', width: '100%', minHeight: '500px', background: '#0f172a' }}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Street View">
            <TileLayer url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`} opacity={0.6} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer url={`https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`} opacity={0.6} />
          </LayersControl.BaseLayer>
        </LayersControl>

        <AnimationEngine 
          ambulances={ambulances} 
          signals={signals} 
          autoTrack={autoTrack} 
          activeFocusId={activeFocusId}
          setSignalStatus={setSignalStatus}
          prioritizeAmbulance={prioritizeAmbulance}
          focusedAmbulanceId={activeFocusId}
          manualOverrides={manualOverrides}
        />

        {hospitals.map(h => (
          <Marker key={h.id} position={h.position} icon={createIcon('#1e293b', 'hosp')}>
            <Popup className="glass-popup">{h.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-10 right-4 z-[400] glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl">
        <h4 className="text-[10px] font-black text-white/30 tracking-[0.2em] mb-3 uppercase">Traffic Core</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-corridorGreen shadow-[0_0_8px_#22c55e]"></div>
             <span className="text-[11px] font-medium text-textPrimary">Priority Corridor</span>
          </div>
          <div className="flex items-center gap-3 text-white/40">
             <div className="w-2 h-2 rounded-full bg-routeYellow"></div>
             <span className="text-[11px] font-medium">Standard Route</span>
          </div>
          <div className="flex items-center gap-3 text-white/40">
             <div className="w-2 h-2 rounded-full bg-routeBlue"></div>
             <span className="text-[11px] font-medium">Clear Path Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
