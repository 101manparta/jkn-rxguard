import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTerminal } from '../../context/TerminalContext';
import {
  Shield,
  Activity,
  Cpu,
  Layers,
  Terminal,
  LogOut,
  UserCheck,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export const TerminalNavbar: React.FC = () => {
  const { currentUser, logout, setCommandPaletteOpen } = useTerminal();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTimeWita, setCurrentTimeWita] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in WITA (UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat('id-ID', options).format(now);
      setCurrentTimeWita(`${formatted} WITA`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'OVERVIEW', path: '/terminal/overview' },
    { label: 'ALERTS', path: '/terminal/alerts' },
    { label: 'NETWORK', path: '/terminal/network' },
    { label: 'PARTICIPANTS', path: '/terminal/participants' },
    { label: 'MEDICATIONS', path: '/terminal/medications' },
    { label: 'FACILITIES', path: '/terminal/facilities' },
    { label: 'INVESTIGATIONS', path: '/terminal/investigations' },
    { label: 'AUDIT', path: '/terminal/audit' },
  ];

  return (
    <header className="border-b border-[#1b2636] bg-[#070b12] text-xs font-mono sticky top-0 z-40 select-none">
      {/* Top telemetry and status bar */}
      <div className="border-b border-[#131d2b] px-3 py-1 flex flex-wrap items-center justify-between text-[11px] bg-[#04070c]">
        {/* Left: Brand and timestamp */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90"
          >
            <span className="font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[1px] bg-cyan-400"></span>
              RXGUARD
            </span>
            <span className="text-gray-400 text-[10px] tracking-wider uppercase border-l border-[#223348] pl-2 hidden sm:inline">
              HEALTHCARE RISK INTELLIGENCE TERMINAL
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-gray-400 border-l border-[#223348] pl-3">
            <span className="text-cyan-300 font-mono font-medium">{currentTimeWita}</span>
          </div>
        </div>

        {/* Center: System Status indicators */}
        <div className="hidden md:flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle"></span>
            <span>API: ONLINE</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>RISK ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>NETWORK ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>ML ENGINE: ONLINE</span>
          </div>
        </div>

        {/* Right: User identity & action */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="bg-[#0e1724] border border-[#1e2f47] px-2 py-0.5 rounded-[2px] flex items-center gap-1.5 text-gray-300">
                <UserCheck className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-bold">
                  {currentUser.role === 'ADMIN' ? 'ADMIN 001' : 'ANALYST 001'}
                </span>
                <span className="text-gray-500 text-[10px]">({currentUser.role})</span>
              </div>

              {currentUser.role === 'ADMIN' ? (
                <NavLink
                  to="/terminal/overview"
                  className="text-gray-400 hover:text-cyan-300 px-1.5 py-0.5 border border-[#1b2636] hover:border-cyan-800 rounded-[2px] transition-colors"
                >
                  Analyst Terminal
                </NavLink>
              ) : (
                <NavLink
                  to="/admin/overview"
                  className="text-gray-400 hover:text-cyan-300 px-1.5 py-0.5 border border-[#1b2636] hover:border-cyan-800 rounded-[2px] transition-colors"
                >
                  Admin Center
                </NavLink>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate('/access');
                }}
                title="Keluar Sesi"
                className="text-gray-500 hover:text-red-400 p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/access')}
              className="text-cyan-400 hover:underline text-[11px]"
            >
              Masuk Terminal
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <nav className="px-3 py-1.5 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1 text-[11px] font-mono tracking-wider transition-colors rounded-[2px] border ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/70 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#0f1724] border-transparent'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Global Terminal Shortcut Trigger */}
        <div className="hidden sm:flex items-center gap-2 pl-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 bg-[#0e1724] hover:bg-[#152336] text-gray-300 hover:text-cyan-300 px-2.5 py-1 border border-[#1e2f47] rounded-[2px] text-[11px] transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terminal Command</span>
            <kbd className="bg-[#05080e] text-cyan-400 px-1 rounded-[1px] text-[9px] border border-cyan-900/60 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1b2636] bg-[#090e17] p-3 space-y-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
            Navigasi Terminal
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 bg-[#0c1420] text-gray-300 text-xs rounded-[2px] border border-[#1b283b] hover:border-cyan-600"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCommandPaletteOpen(true);
            }}
            className="w-full mt-2 py-2 bg-cyan-900/40 text-cyan-300 border border-cyan-700/60 rounded-[2px] text-xs font-mono flex items-center justify-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5" />
            Buka Command Terminal (Ctrl+K)
          </button>
        </div>
      )}
    </header>
  );
};
