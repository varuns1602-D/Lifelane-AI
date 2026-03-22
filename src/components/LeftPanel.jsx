import { Ambulance } from 'lucide-react';

export default function LeftPanel() {
  // Define intersections (nodes)
  const nodes = [
    { id: 1, x: 200, y: 150, signal: 'green' },
    { id: 2, x: 450, y: 100, signal: 'red' },
    { id: 3, x: 700, y: 200, signal: 'green' },
    { id: 4, x: 150, y: 400, signal: 'red' },
    { id: 5, x: 400, y: 500, signal: 'green' },
    { id: 6, x: 750, y: 450, signal: 'green' },
    { id: 7, x: 300, y: 700, signal: 'red' },
    { id: 8, x: 600, y: 750, signal: 'green' },
  ];

  // Corridor Path (ids): 1 -> 2 -> 3 -> 6
  // String for SVG path
  const corridorPath = "M200,150 L450,100 L700,200 L750,450";

  return (
    <div className="hidden lg:flex flex-1 flex-col bg-gradient-to-br from-[#081225] to-[#0f1f3d] relative overflow-hidden border-r border-white/5">
      {/* Background Decor: Radial Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08)_0%,transparent_70%)] animate-heartbeat pointer-events-none" />
      
      {/* Background EKG Line */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
        <path 
          d="M0,200 L200,200 L220,150 L240,250 L260,100 L280,300 L300,200 L500,200 L520,180 L540,220 L560,150 L580,250 L600,200 L1000,200" 
          fill="none" 
          stroke="#22c55e" 
          strokeWidth="2" 
          className="animate-ekg"
        />
      </svg>
      
      {/* Network Visualization Section */}
      <div className="flex-1 relative flex items-center justify-center p-12 select-none">
        <svg viewBox="0 0 1000 900" className="w-full h-full max-w-2xl drop-shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-visible">
          {/* Background Connections (Inactive roads) */}
          <g stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none">
            <line x1="200" y1="150" x2="150" y2="400" />
            <line x1="150" y1="400" x2="300" y2="700" />
            <line x1="150" y1="400" x2="400" y2="500" />
            <line x1="450" y1="100" x2="700" y2="200" />
            <line x1="400" y1="500" x2="300" y2="700" />
            <line x1="400" y1="500" x2="600" y2="750" />
            <line x1="700" y1="200" x2="750" y2="450" />
            <line x1="750" y1="450" x2="600" y2="750" />
          </g>

          {/* Corridor Path (Highlighted Road) */}
          <path 
            d={corridorPath} 
            fill="none" 
            stroke="#22c55e" 
            strokeWidth="4" 
            strokeDasharray="10 12"
            className="opacity-20 blur-[2px]" 
          />
          
          <path 
            d={corridorPath} 
            fill="none" 
            stroke="#22c55e" 
            strokeWidth="1.5" 
            className="animate-glow-shift" 
          />

          {/* Node Visualization */}
          {nodes.map(node => (
            <g key={node.id}>
              {/* Outer decorative ring */}
              <circle 
                cx={node.x} 
                cy={node.y} 
                r="12" 
                fill="none" 
                stroke={node.signal === 'green' ? '#22c55e' : '#ef4444'} 
                strokeWidth="0.5" 
                className="opacity-20 translate-z-0" 
              />
              
              {/* Pulsing glow for green signals */}
              {node.signal === 'green' && (
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="18" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="1" 
                  className="animate-pulse-node" 
                />
              )}

              {/* Core Node */}
              <circle 
                cx={node.x} 
                cy={node.y} 
                r="4" 
                fill={node.signal === 'green' ? '#22c55e' : '#ef4444'} 
                className={`${node.signal === 'green' ? 'shadow-[0_0_10px_#22c55e]' : ''}`} 
              />
            </g>
          ))}

          {/* Moving Ambulance Animation */}
          <g 
            className="animate-ambulance" 
            style={{ 
              offsetPath: `path("${corridorPath}")`,
              transformOrigin: 'center'
            }}
          >
             {/* Glowing indicator */}
             <circle r="15" fill="#22c55e" className="opacity-10 animate-pulse" />
             
             {/* Ambulance Body */}
             <rect 
               x="-12" 
               y="-8" 
               width="24" 
               height="16" 
               rx="4" 
               fill="#22c55e" 
               className="shadow-[0_0_20px_#22c55e]" 
             />
             
             {/* Tiny Icon */}
             <foreignObject x="-7" y="-7" width="14" height="14">
                <Ambulance size={14} className="text-green-950" />
             </foreignObject>
          </g>
        </svg>

      </div>

    </div>
  );
}
