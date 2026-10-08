import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Play, Pause, ChevronRight } from 'lucide-react';

export const TransactionTicker: React.FC = () => {
  const { transactionFeed } = useTerminal();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <footer className="h-10 border-t border-[#1b2636] bg-[#070b12] text-xs font-mono flex items-center px-3 select-none overflow-hidden shrink-0 z-20">
      {/* Label */}
      <div className="flex items-center gap-2 pr-3 border-r border-[#1a2535] shrink-0 text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-cyan-400 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" />
          FEED KLAIM
        </span>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-gray-500 hover:text-gray-300 p-0.5 rounded transition-colors"
          title={isPaused ? 'Resume live feed' : 'Pause feed'}
        >
          {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>

      {/* Marquee / items */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar flex items-center gap-4 px-3 whitespace-nowrap">
        {transactionFeed.slice(0, 8).map((tx) => {
          let sevColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
          if (tx.riskSeverity === 'CRITICAL') {
            sevColor = 'text-red-400 bg-red-950/50 border-red-800/60 font-bold';
          } else if (tx.riskSeverity === 'HIGH') {
            sevColor = 'text-orange-400 bg-orange-950/40 border-orange-800/50';
          } else if (tx.riskSeverity === 'MEDIUM') {
            sevColor = 'text-amber-400 bg-amber-950/40 border-amber-800/50';
          }

          return (
            <div
              key={tx.id}
              onClick={() => navigate(`/terminal/participants?id=${tx.participantId}`)}
              className="inline-flex items-center gap-2 hover:bg-[#0f1724] px-2 py-1 rounded-[2px] cursor-pointer transition-colors border border-transparent hover:border-[#1e2e42]"
            >
              <span className="text-gray-500 text-[10px]">{tx.timestamp.split(' ')[0]}</span>
              <span className="text-cyan-300 font-medium hover:underline">{tx.participantId}</span>
              <span className="text-blue-400">{tx.facilityId}</span>
              <span className="text-amber-300">{tx.medicationId}</span>
              <span className={`text-[10px] px-1.5 py-0.2 border rounded-[2px] ${sevColor}`}>
                {tx.riskSignal}
              </span>
              <span className="text-gray-500 text-[10px]">
                Rp {tx.amount.toLocaleString('id-ID')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action to view all alerts */}
      <button
        onClick={() => navigate('/terminal/alerts')}
        className="shrink-0 pl-3 border-l border-[#1a2535] text-[11px] text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
      >
        <span>Lihat Semua</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </footer>
  );
};
