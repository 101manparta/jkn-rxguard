import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DataDisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-[#0b111a] border-b border-[#1b2636] px-3 py-1 flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          DATA SIMULASI TERENKRIPSI
        </span>
        <span className="text-gray-500">
          Pseudonym Identifier (P00xxx, FKTPxxx, MEDX) — Tidak Ada NIK/Data Rekam Medis Nyata
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#0b131f]/90 border border-[#1b2a3d] px-3 py-2 rounded-[2px] flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-gray-300">
          <strong className="text-cyan-400">MODE SIMULASI INTELIJEN:</strong> Seluruh entitas menggunakan identitas tersamarkan (pseudonym). Indikasi risiko berfungsi sebagai pendukung investigasi, bukan vonis otomatis.
        </span>
      </div>
      <span className="bg-[#121f30] text-cyan-400 text-[10px] px-2 py-0.5 border border-cyan-800/60 rounded-[2px] shrink-0 font-bold ml-2">
        SIMULASI RESMI
      </span>
    </div>
  );
};
