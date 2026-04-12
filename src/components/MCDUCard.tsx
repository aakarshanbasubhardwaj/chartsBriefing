import { useState } from 'react';
import VoiceBriefing from './VoiceBriefing';
import VerticalProfile from './VerticalProfile';
import PDFPreview from './PDFPreview';

interface MCDUProps {
  data: {
    airport?: string;
    procedure?: string;
    freq?: string;
    course?: string;
    transAlt?: string;
    da?: string;
    TDZE?: string;
    approachCat?: string;
    missedApp?: string;
    waypoints?: { name: string; alt: number }[];
  } | null;
  pdfFile: File | null;
  pdfPage: number;
}

export default function MCDUCard({ data, pdfFile, pdfPage }: MCDUProps) {
  const [page, setPage] = useState(1);
  const totalPages = 3;

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

  const getPageTitle = () => {
    if (page === 1) return "APPROACH BRIEF";
    if (page === 2) return "VERTICAL PROFILE";
    return "CHART VIEWER";
  };

  return (
    <div className="bg-black p-6 rounded-3xl border-[1px] border-gray-800 shadow-2xl w-full ring-4 ring-gray-900 transition-all duration-300">
      {/* SCREEN HEADER */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-6">
        <span className="text-white text-xs font-bold tracking-tighter">{getPageTitle()}</span>
        <span className="text-gray-500 text-[10px] font-mono">{page}/{totalPages}</span>
      </div>
      <div>

        {/* PAGE 1: APPROACH DATA */}
        {page === 1 && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-x-4">
              <MCDURow label="Arrival" value={data.airport || "----"} />
              <MCDURow label="Procedure" value={data.procedure || "----"} side="R" />

              <MCDURow label="ILS/VOR Freq" value={data.freq || "----"} />
              <MCDURow label="Final CRS" value={data.course ? `${data.course}` : '---'} side="R" />

              <MCDURow label="Trans Alt" value={data.transAlt || "----"} />
              <MCDURow label="Decision Alt" value={data.da ? `${data.da} FT` : '---'} side="R" />

              <MCDURow label="Type / Cat" value={data.approachCat || '---'} />
              <MCDURow label="TDZE" value={data.TDZE || '---'} side="R" />
            </div>

            <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded">
              <p className="text-[9px] text-orange-400 font-mono uppercase mb-1">Missed Approach (Initial)</p>
              <p className="text-xs text-white font-mono leading-relaxed">
                {data.missedApp || "NO DATA EXTRACTED"}
              </p>
            </div>
          </div>
        )}

        {/* PAGE 2: VERTICAL PROFILE */}
        {page === 2 && (
          <div className="animate-in fade-in duration-300 flex items-center justify-center h-full ">
            <VerticalProfile data={data} />
          </div>
        )}

        {/* PAGE 3: PDF VIEWER */}
        {page === 3 && (
          <div className="animate-in fade-in duration-300">
            <PDFPreview file={pdfFile} pageNumber={pdfPage} />
          </div>
        )}

      </div>

      {/* SCREEN FOOTER Line Select Keys */}
      <div className="mt-8 pt-4 border-t border-gray-800 flex justify-between items-center">

        {/* Left Side: Show 'PREV' on pages 2 & 3, show Voice Briefing on page 1 */}
        <div className="w-1/3">
          {page > 1 ? (
            <button
              onClick={() => setPage(p => p - 1)}
              className="text-[10px] text-gray-400 hover:text-white font-mono transition-colors"
            >
              {'<'} PREV
            </button>
          ) : (
            <VoiceBriefing data={data} />
          )}
        </div>

        {/* Right Side: Show 'NEXT' on pages 1 & 2 */}
        <div className="w-1/3 text-right">
          {page < totalPages && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="text-[10px] text-gray-400 hover:text-white font-mono transition-colors"
            >
              NEXT {'>'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}