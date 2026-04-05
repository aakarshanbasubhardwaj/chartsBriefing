interface MCDUProps {
  data: {
    airport?: string;
    procedure?: string;
    freq?: string;
    course?: string;
    transAlt?: string;
    da?: string;
    missedApp?: string;
  } | null;
}

export default function MCDUCard({ data }: MCDUProps) {
  if (!data) return null;

  // Helper to render a row in MCDU style
  const MCDURow = ({ label, value, side = 'L' }: { label: string; value: string; side?: 'L' | 'R' }) => (
    <div className={`mb-4 ${side === 'R' ? 'text-right' : 'text-left'}`}>
      <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest leading-none">
        {label}
      </p>
      <p className="text-xl text-green-500 font-mono font-bold leading-tight uppercase">
        {value || '---'}
      </p>
    </div>
  );

  return (
    <div className="bg-black p-6 rounded-3xl border-[12px] border-gray-800 shadow-2xl w-full ring-4 ring-gray-900">
      {/* SCREEN HEADER */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-6">
        <span className="text-white text-xs font-bold tracking-tighter">APPROACH BRIEF</span>
        <span className="text-gray-500 text-[10px] font-mono">1/1</span>
      </div>

      {/* MCDU DATA ROWS */}
      <div className="grid grid-cols-2 gap-x-4">
        <MCDURow label="Arrival" value={data.airport} />
        <MCDURow label="Procedure" value={data.procedure} side="R" />
        
        
        <MCDURow label="ILS/VOR Freq" value={data.freq} />
        <MCDURow label="Final CRS" value={data.course ? `${data.course}` : '---'} side="R" />
        
        <MCDURow label="Trans Alt" value={data.transAlt} />
        <MCDURow label="Decision Alt" value={data.da ? `${data.da} FT` : '---'} side="R" />
        
        <MCDURow label="Type / Cat" value={data.approachCat || '---'} />

      </div>

      {/* MISSED APPROACH BOX */}
      <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded">
        <p className="text-[9px] text-orange-400 font-mono uppercase mb-1">Missed Approach (Initial)</p>
        <p className="text-xs text-white font-mono leading-relaxed">
          {data.missedApp || "NO DATA EXTRACTED"}
        </p>
      </div>

      {/* SCREEN FOOTER */}
      <div className="mt-8 flex justify-between items-end">
        <div className="text-[10px] text-gray-600 font-mono">{'<'} RETURN</div>
        <div className="text-[10px] text-gray-600 font-mono">INSERT {'>'}</div>
      </div>
    </div>
  );
}