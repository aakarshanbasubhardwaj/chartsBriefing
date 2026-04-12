import { motion } from 'framer-motion';

interface Waypoint {
  name: string;
  alt: number;
}

interface ProfileProps {
  data: {
    waypoints?: Waypoint[];
  } | null;
}

export default function VerticalProfile({ data }: ProfileProps) {
  if (!data || !data.waypoints || data.waypoints.length === 0) return null;

  const waypoints = data.waypoints;
  
  // Dynamic Zoom: Focus only on the active flight levels
  const alts = waypoints.map(w => w.alt);
  const maxAlt = Math.max(...alts);
  const minAlt = Math.min(...alts);
  
  const yMax = maxAlt + 500;
  const yMin = Math.max(0, minAlt - 500);
  const altRange = yMax - yMin;

  // Taller Canvas (800x600) makes the descent look steeper and less "squeezed"
  const width = 800;  
  const height = 600; 
  const px = 100;      
  const py = 100;      

  const getX = (i: number) => (i / (waypoints.length - 1)) * (width - px * 2) + px;
  const getY = (alt: number) => {
    const percentage = (alt - yMin) / altRange;
    return height - (percentage * (height - py * 2) + py);
  };

  const pathData = waypoints
    .map((w, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(w.alt)}`)
    .join(' ');

  return (
    <div className="bg-gray-950 p-8 rounded-3xl border-2 border-gray-800 shadow-2xl w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Dynamic Grid */}
        {[yMin, yMax].map((tick) => (
          <g key={tick}>
            <line x1={px} x2={width - px} y1={getY(tick)} y2={getY(tick)} stroke="#1f2937" strokeWidth="2" strokeDasharray="8" />
            <text x="0" y={getY(tick) + 6} fill="#4b5563" fontSize="20" className="font-mono font-bold">{Math.round(tick)}</text>
          </g>
        ))}

        <motion.path
          d={pathData}
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />

        {waypoints.map((w, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(w.alt)} r="12" fill="#10b981" stroke="#064e3b" strokeWidth="4" />
            
            {/* Waypoint Text - Clean & Centered */}
            <text x={getX(i)} y={getY(w.alt) - 40} textAnchor="middle" fill="white" fontSize="28" className="font-black uppercase tracking-tighter">
              {w.name}
            </text>
            <text x={getX(i)} y={getY(w.alt) + 50} textAnchor="middle" fill="#34d399" fontSize="24" className="font-mono font-bold">
              {w.alt}
            </text>

            {/* Config Icons - Simplified for the new width */}
            <g transform={`translate(${getX(i)}, ${height - 40})`}>
              {i === 0 && <ConfigIcon label="FLAPS 1" color="text-blue-400" />}
              {w.alt <= 3000 && w.alt >= 1800 && i !== 0 && i !== waypoints.length - 1 && (
                <ConfigIcon label="GEAR" color="text-orange-500" />
              )}
              {i === waypoints.length - 1 && <ConfigIcon label="FULL" color="text-emerald-400" />}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ConfigIcon({ label, color }: { label: string; color: string }) {
  return (
    <foreignObject x="-40" y="0" width="80" height="40">
      <div className={`text-[10px] font-black border-2 border-current rounded px-1 py-1 text-center ${color} bg-black uppercase`}>
        {label}
      </div>
    </foreignObject>
  );
}