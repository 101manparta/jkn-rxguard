import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { useNavigate } from 'react-router-dom';
import { Terminal, X, CornerDownLeft, ArrowUpRight, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { RiskScoreBadge } from './StatusBadge';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    executeCommand,
    commandHistory,
    lastCommandResult,
    clearCommandResult,
  } = useTerminal();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInputVal('');
      setHistoryIndex(-1);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputVal.trim()) return;
      executeCommand(inputVal);
      setInputVal('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  const runQuick = (cmd: string) => {
    executeCommand(cmd);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-2xl bg-[#070c14] border border-[#1e2f46] rounded-[3px] shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0a121d] border-b border-[#1b2b3f] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="font-bold text-gray-200">RXGUARD INTELLIGENCE COMMAND OVERLAY</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px]">
            <span>[Esc] Tutup</span>
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input prompt area */}
        <div className="p-3.5 bg-[#05080e] border-b border-[#172436] flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-xs shrink-0 select-none">
            analyst@rxguard:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik command, cth: search peserta P00182, network MEDX, risk critical..."
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 focus:outline-hidden text-xs font-mono"
          />
          <button
            onClick={() => {
              if (inputVal.trim()) {
                executeCommand(inputVal);
                setInputVal('');
              }
            }}
            className="px-2.5 py-1 bg-[#101e30] hover:bg-[#182c47] text-cyan-300 border border-cyan-800/60 rounded-[2px] text-xs flex items-center gap-1 transition-colors"
          >
            <span>Eksekusi</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Quick commands shortcut pills */}
        <div className="px-3.5 py-2 bg-[#070e17] border-b border-[#142131] flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-gray-500 text-[10px]">Cepat:</span>
          {[
            'search peserta P00182',
            'search obat MEDX',
            'search fasilitas FKTP0182',
            'risk critical',
            'network P00182',
            'investigate INV0281',
            'alerts',
            'help',
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => runQuick(cmd)}
              className="px-2 py-0.5 bg-[#0d1624] hover:bg-[#15243a] text-gray-300 hover:text-cyan-300 border border-[#1d2c40] rounded-[2px] text-[10px] transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Visual Results Area */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {lastCommandResult ? (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  HASIL EKSEKUSI PERINTAH:
                </span>
                <span className="text-gray-500">[{lastCommandResult.command}]</span>
              </div>

              {lastCommandResult.type === 'help' && (
                <div className="bg-[#05090f] p-3 border border-[#1b2b3e] rounded-[2px] text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {lastCommandResult.rawText}
                </div>
              )}

              {lastCommandResult.type === 'not_found' && (
                <div className="bg-red-950/20 border border-red-800/40 p-3 rounded-[2px] text-red-300 text-xs">
                  <div className="font-bold">{lastCommandResult.title}</div>
                  <div className="text-gray-400 mt-1">{lastCommandResult.rawText}</div>
                </div>
              )}

              {(lastCommandResult.type === 'participant' ||
                lastCommandResult.type === 'medication' ||
                lastCommandResult.type === 'facility' ||
                lastCommandResult.type === 'investigation') && (
                <div className="bg-[#0a121e] border border-cyan-800/50 p-4 rounded-[3px] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                        {lastCommandResult.type} IDENTIFIER
                      </div>
                      <h3 className="text-base font-bold text-gray-100 mt-0.5">
                        {lastCommandResult.title}
                      </h3>
                      {lastCommandResult.statusText && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Status: <span className="text-gray-200">{lastCommandResult.statusText}</span>
                        </p>
                      )}
                    </div>
                    {lastCommandResult.riskScore !== undefined && (
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block mb-1">SKOR RISIKO</span>
                        <RiskScoreBadge
                          score={lastCommandResult.riskScore}
                          level={lastCommandResult.riskLevel as any}
                        />
                      </div>
                    )}
                  </div>

                  {lastCommandResult.signals && lastCommandResult.signals.length > 0 && (
                    <div className="bg-[#05090f] p-2.5 border border-[#152335] rounded-[2px]">
                      <div className="text-[11px] text-gray-400 mb-1.5 font-semibold">
                        SINYAL DETEKSI SISTEM:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {lastCommandResult.signals.map((sig, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#0c1828] text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded-[2px]"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastCommandResult.targetRoute && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          navigate(lastCommandResult.targetRoute!);
                          setCommandPaletteOpen(false);
                          clearCommandResult();
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold font-mono text-xs rounded-[2px] flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>BUKA DETAIL / INVESTIGASI</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {lastCommandResult.type === 'filter' && (
                <div className="bg-[#0a121e] border border-[#1c2e44] p-3 rounded-[3px] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-100">{lastCommandResult.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{lastCommandResult.statusText}</p>
                  </div>
                  {lastCommandResult.targetRoute && (
                    <button
                      onClick={() => {
                        navigate(lastCommandResult.targetRoute!);
                        setCommandPaletteOpen(false);
                        clearCommandResult();
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold font-mono text-xs rounded-[2px] flex items-center gap-1"
                    >
                      <span>Lihat Hasil</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs">
              <Terminal className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">Terminal siap menerima kueri intelijen.</p>
              <p className="text-[11px] text-gray-600 mt-1">
                Ketik command atau pilih salah satu tombol shortcut di atas.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-3.5 py-1.5 bg-[#05080e] border-t border-[#131d2b] flex items-center justify-between text-[10px] text-gray-500">
          <span>Gunakan panah atas/bawah untuk riwayat command</span>
          <span className="text-cyan-400/70">RXGUARD CORE v2.4-PROTOTYPE</span>
        </div>
      </div>
    </div>
  );
};
