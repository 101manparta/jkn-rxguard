import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { useNavigate } from 'react-router-dom';
import { Terminal, CornerDownLeft, ArrowUpRight, X, AlertTriangle } from 'lucide-react';
import { SeverityBadge, RiskScoreBadge } from './StatusBadge';

const AUTOCOMPLETE_SUGGESTIONS = [
  'search peserta P00182',
  'search peserta P00412',
  'search obat MEDX',
  'search obat MEDY',
  'search fasilitas FKTP0182',
  'search fasilitas FKTP0291',
  'risk critical',
  'risk high',
  'network P00182',
  'network MEDX',
  'investigate INV0281',
  'alerts',
  'help',
  'clear',
];

export const TerminalCommandBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    executeCommand,
    commandHistory,
    lastCommandResult,
    clearCommandResult,
    setCommandPaletteOpen,
  } = useTerminal();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputVal.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = AUTOCOMPLETE_SUGGESTIONS.filter((s) =>
      s.toLowerCase().startsWith(inputVal.toLowerCase()) ||
      s.toLowerCase().includes(inputVal.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(filtered.length > 0);
  }, [inputVal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputVal.trim()) return;
      const res = executeCommand(inputVal);
      setInputVal('');
      setShowSuggestions(false);
      setHistoryIndex(-1);

      // If user typed investigate or network or alerts directly, can also navigate if requested
      if (res.targetRoute && !res.riskScore) {
        navigate(res.targetRoute);
      }
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
      setShowSuggestions(false);
      clearCommandResult();
    }
  };

  const handleSelectSuggestion = (s: string) => {
    setInputVal(s);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full bg-[#080d14] border-b border-[#1b2636] font-mono text-xs select-none relative z-30">
      {/* Top terminal bar header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#131d2b] bg-[#05080d] text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-gray-300">RXGUARD COMMAND TERMINAL</span>
          <span className="text-[#2b3c52]">|</span>
          <span className="text-gray-500 hidden sm:inline">Ketik perintah atau gunakan shortcut [Ctrl + K]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#0f1722] text-gray-400 px-1.5 py-0.5 border border-[#1b2636] rounded-[2px] hidden md:inline">
            Tab: Autocomplete
          </span>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="text-[10px] bg-[#0c1a29] text-cyan-400 hover:bg-[#122840] px-2 py-0.5 border border-cyan-800/60 rounded-[2px] transition-colors"
          >
            Terminal Overlay (Ctrl+K)
          </button>
        </div>
      </div>

      {/* Interactive Command Input Line */}
      <div className="flex items-center px-3 py-2 bg-[#080d14] relative">
        <span className="text-cyan-400 font-semibold shrink-0 mr-2 flex items-center gap-1">
          <span>analyst@rxguard:~$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="search peserta P00182 | search obat MEDX | risk high | help..."
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 focus:outline-hidden text-xs font-mono"
        />
        <button
          onClick={() => {
            if (inputVal.trim()) {
              executeCommand(inputVal);
              setInputVal('');
              setShowSuggestions(false);
            }
          }}
          className="ml-2 px-2 py-1 bg-[#101b2b] hover:bg-[#16273e] text-cyan-400 border border-[#20344d] rounded-[2px] flex items-center gap-1 text-[11px] transition-colors"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-36 top-10 w-80 bg-[#090f18] border border-[#223348] rounded-[2px] shadow-2xl overflow-hidden z-50">
            <div className="px-2 py-1 bg-[#0f1826] text-[10px] text-gray-400 border-b border-[#1f2c3d]">
              SUGESTI PERINTAH (Klik untuk memilih)
            </div>
            {suggestions.map((s) => (
              <div
                key={s}
                onClick={() => handleSelectSuggestion(s)}
                className="px-2.5 py-1.5 hover:bg-[#142337] text-gray-300 hover:text-cyan-300 cursor-pointer flex items-center justify-between text-xs transition-colors border-b border-[#121c29] last:border-0"
              >
                <span>{s}</span>
                <span className="text-[10px] text-gray-500 font-sans">Enter</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Command Result Panel */}
      {lastCommandResult && (
        <div className="border-t border-[#182638] bg-[#070c14] p-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-[2px]">
                RESULT
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                Command: <strong className="text-gray-200">{lastCommandResult.command}</strong>
              </span>
            </div>
            <button
              onClick={clearCommandResult}
              className="text-gray-500 hover:text-gray-300 p-0.5"
              title="Tutup Hasil"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual card content based on result type */}
          {lastCommandResult.type === 'help' && (
            <pre className="bg-[#05080e] p-2.5 border border-[#162232] rounded-[2px] text-gray-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
              {lastCommandResult.rawText}
            </pre>
          )}

          {lastCommandResult.type === 'system' && (
            <div className="bg-[#060a10] p-2 border border-[#18273a] text-gray-300 rounded-[2px]">
              {lastCommandResult.rawText}
            </div>
          )}

          {lastCommandResult.type === 'not_found' && (
            <div className="bg-red-950/20 p-2.5 border border-red-900/50 text-red-300 rounded-[2px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold">{lastCommandResult.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{lastCommandResult.rawText}</p>
              </div>
            </div>
          )}

          {(lastCommandResult.type === 'participant' ||
            lastCommandResult.type === 'medication' ||
            lastCommandResult.type === 'facility' ||
            lastCommandResult.type === 'investigation') && (
            <div className="bg-[#09111b] border border-[#1c2e44] p-3 rounded-[3px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-gray-100">{lastCommandResult.title}</h4>
                  {lastCommandResult.riskScore !== undefined && (
                    <RiskScoreBadge
                      score={lastCommandResult.riskScore}
                      level={lastCommandResult.riskLevel as any}
                    />
                  )}
                  {lastCommandResult.statusText && (
                    <span className="text-[10px] text-gray-400 border border-gray-700/60 px-1.5 py-0.5 rounded-[2px]">
                      {lastCommandResult.statusText}
                    </span>
                  )}
                </div>

                {lastCommandResult.signals && lastCommandResult.signals.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1">Sinyal Risiko:</span>
                    {lastCommandResult.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-[#111f30] text-cyan-300 border border-cyan-800/50 px-1.5 py-0.5 rounded-[2px]"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                )}

                {lastCommandResult.rawText && (
                  <p className="text-[11px] text-gray-400">{lastCommandResult.rawText}</p>
                )}
              </div>

              {lastCommandResult.targetRoute && (
                <button
                  onClick={() => {
                    navigate(lastCommandResult.targetRoute!);
                    clearCommandResult();
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold font-mono text-xs rounded-[2px] flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <span>BUKA INVESTIGASI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {lastCommandResult.type === 'filter' && (
            <div className="bg-[#09111b] border border-[#1c2e44] p-3 rounded-[3px] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-100">{lastCommandResult.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{lastCommandResult.statusText}</p>
              </div>
              {lastCommandResult.targetRoute && (
                <button
                  onClick={() => {
                    navigate(lastCommandResult.targetRoute!);
                    clearCommandResult();
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold font-mono text-xs rounded-[2px] flex items-center gap-1 transition-colors"
                >
                  <span>Buka Tabel Alert</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
