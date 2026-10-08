import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { Shield, Lock, KeyRound, Terminal, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DataDisclaimerBanner } from '../components/common/DataDisclaimerBanner';

export const LoginPage: React.FC = () => {
  const { login } = useTerminal();
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!orgId.trim()) {
      setErrorMessage('Organization ID wajib diisi');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const clean = orgId.trim().toLowerCase();
      const success = login(clean);

      if (success) {
        if (clean.includes('admin')) {
          navigate('/admin/overview');
        } else {
          navigate('/terminal/overview');
        }
      } else {
        setErrorMessage('Autentikasi gagal: ID kredensial tidak terdaftar dalam protokol restricted access.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (demoUser: 'analyst.demo' | 'admin.demo') => {
    setOrgId(demoUser);
    setPassword('••••••••••••');
    setIsLoading(true);
    setTimeout(() => {
      login(demoUser);
      if (demoUser === 'admin.demo') {
        navigate('/admin/overview');
      } else {
        navigate('/terminal/overview');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#05080e] flex flex-col justify-between font-mono text-xs select-none">
      <DataDisclaimerBanner compact={true} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#080d14] border border-[#1b2a3c] rounded-[3px] shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#0b131f] border-b border-[#18283a] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-[1px]"></span>
              <div>
                <span className="font-bold text-gray-200 tracking-wider">RXGUARD</span>
                <span className="text-[10px] text-gray-400 block">SECURE ACCESS TERMINAL</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-[2px]">
              RESTRICTED
            </span>
          </div>

          {/* Form container */}
          <div className="p-6 space-y-5">
            <div className="border border-red-900/40 bg-red-950/20 px-3 py-2 rounded-[2px] flex items-center gap-2 text-red-300 text-[11px]">
              <Lock className="w-4 h-4 shrink-0 text-red-400" />
              <span>AUTHORIZED PERSONNEL ONLY — Akses dipantau dan diaudit permanen.</span>
            </div>

            {errorMessage && (
              <div className="border border-red-800 bg-red-950/40 p-2.5 rounded-[2px] text-red-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-[11px] mb-1.5 uppercase font-medium">
                  Organization ID / User ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    placeholder="cth: analyst.demo atau admin.demo"
                    autoFocus
                    className="w-full bg-[#05080e] border border-[#1d2d3f] text-gray-100 px-3 py-2 text-xs rounded-[2px] focus:outline-hidden focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] mb-1.5 uppercase font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#05080e] border border-[#1d2d3f] text-gray-100 px-3 py-2 text-xs rounded-[2px] focus:outline-hidden focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isLoading ? 'MEMPROSES KREDENSIAL...' : 'AUTENTIKASI'}</span>
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="pt-3 border-t border-[#142030] space-y-2">
              <span className="text-[10px] text-gray-500 block uppercase tracking-wider">
                AKSES CEPAT PROTOTYPE (PILIH AKUN):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst.demo')}
                  className="px-2.5 py-1.5 bg-[#0b1420] hover:bg-[#112035] text-cyan-300 border border-[#1b3149] rounded-[2px] text-left text-[11px] transition-colors flex items-center justify-between"
                >
                  <div>
                    <strong className="block font-semibold">analyst.demo</strong>
                    <span className="text-[9px] text-gray-500">Analis Investigasi</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.demo')}
                  className="px-2.5 py-1.5 bg-[#0b1420] hover:bg-[#112035] text-amber-300 border border-[#1b3149] rounded-[2px] text-left text-[11px] transition-colors flex items-center justify-between"
                >
                  <div>
                    <strong className="block font-semibold">admin.demo</strong>
                    <span className="text-[9px] text-gray-500">Admin Kontrol</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* System Status Display */}
            <div className="pt-3 border-t border-[#142030]">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                STATUS KONEKTIVITAS SUBSISTEM:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center justify-between p-1.5 bg-[#05090f] border border-[#152335] rounded-[2px]">
                  <span className="text-gray-400">API</span>
                  <span className="text-emerald-400 font-semibold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#05090f] border border-[#152335] rounded-[2px]">
                  <span className="text-gray-400">RISK ENGINE</span>
                  <span className="text-emerald-400 font-semibold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#05090f] border border-[#152335] rounded-[2px]">
                  <span className="text-gray-400">DATABASE</span>
                  <span className="text-emerald-400 font-semibold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#05090f] border border-[#152335] rounded-[2px]">
                  <span className="text-gray-400">NETWORK ENGINE</span>
                  <span className="text-emerald-400 font-semibold">ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="bg-[#05080e] border-t border-[#152233] px-4 py-2 flex items-center justify-between text-[10px] text-gray-500">
            <span>TERMINAL ENCRYPTION: TLS 1.3</span>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>

      <footer className="p-3 text-center text-gray-600 text-[11px] border-t border-[#101724]">
        JKN RXGUARD • PROTOKOL AKSES AMAN TERBATAS • DATA SIMULASI RESMI
      </footer>
    </div>
  );
};
