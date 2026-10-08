import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { Medication } from '../types';
import {
  Pill,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Building,
  Activity,
  Layers,
  ChevronRight,
  Network,
} from 'lucide-react';
import { RiskScoreBadge } from '../components/common/StatusBadge';

export const MedicationsPage: React.FC = () => {
  const { medications } = useTerminal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [selectedMed, setSelectedMed] = useState<Medication | null>(() => {
    if (initialId) {
      const match = medications.find((m) => m.id.toUpperCase() === initialId.toUpperCase());
      if (match) return match;
    }
    return medications[0]; // MEDX
  });

  const [searchQuery, setSearchQuery] = useState(initialId);

  const filteredMeds = medications.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-amber-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            MEDICATION INTELLIGENCE
          </h1>
          <span className="text-gray-500">| PEMANTAUAN OBAT & ALKES BERISIKO TINGGI</span>
        </div>
        <div className="text-gray-400">
          KATALOG SIMULASI: <strong className="text-amber-400">{medications.length} KELAS TERAPI</strong>
        </div>
      </div>

      {/* Main Grid: Left Table (7 cols) + Right Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Table Column */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search bar */}
          <div className="bg-[#080d14] border border-[#1a283a] p-2.5 rounded-[2px] flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode obat (cth: MEDX) atau kategori terapi..."
              className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-hidden text-xs font-mono"
            />
          </div>

          {/* Table */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Kode Obat</th>
                    <th className="py-2.5 px-3">Nama Simulasi</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Total Klaim</th>
                    <th className="py-2.5 px-3 text-center">Faskes</th>
                    <th className="py-2.5 px-3 text-center">Kejadian Risiko</th>
                    <th className="py-2.5 px-3 text-center">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121c29]">
                  {filteredMeds.map((m) => {
                    const isSelected = selectedMed?.id === m.id;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedMed(m)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#141b24] border-l-2 border-amber-400' : 'hover:bg-[#0c1420]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-amber-300 group-hover:text-amber-200">
                          {m.id}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-gray-200 text-xs">
                          {m.name}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                          {m.category}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-300 font-bold">
                          {m.transactionCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-center text-blue-400">
                          {m.facilityCount}
                        </td>
                        <td className="py-2.5 px-3 text-center text-red-400 font-bold">
                          {m.riskEvents}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <RiskScoreBadge score={m.riskScore} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-5 space-y-3">
          {selectedMed ? (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#142232]">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    PROFIL OBAT & RESEP SIMULASI
                  </div>
                  <h2 className="text-xl font-bold text-amber-300 mt-0.5">{selectedMed.id}</h2>
                  <p className="text-xs text-gray-300 font-sans mt-0.5">{selectedMed.name}</p>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Kategori: {selectedMed.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block mb-1">SKOR RISIKO OBAT</span>
                  <RiskScoreBadge score={selectedMed.riskScore} />
                </div>
              </div>

              {/* Aggregation Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-[#0a121e] border border-[#162538] rounded-[2px]">
                  <span className="text-[10px] text-gray-500 block">TOTAL KLAIM</span>
                  <span className="text-base font-bold text-gray-100">
                    {selectedMed.transactionCount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-2.5 bg-[#0a121e] border border-[#162538] rounded-[2px]">
                  <span className="text-[10px] text-gray-500 block">FASKES PERESEP</span>
                  <span className="text-base font-bold text-blue-400">
                    {selectedMed.facilityCount}
                  </span>
                </div>
                <div className="p-2.5 bg-[#0a121e] border border-[#162538] rounded-[2px]">
                  <span className="text-[10px] text-gray-500 block">EVENT ANOMALI</span>
                  <span className="text-base font-bold text-red-400">
                    {selectedMed.riskEvents}
                  </span>
                </div>
              </div>

              {/* Signals */}
              <div>
                <div className="text-[11px] text-gray-400 uppercase font-semibold mb-2">
                  SINYAL POLA RISIKO KHUSUS:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMed.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#1a140a] text-amber-300 border border-amber-800/60 rounded-[2px] text-xs"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guidelines Info */}
              <div className="p-3 bg-[#0a111a] border border-[#162334] rounded-[2px] text-[11px] text-gray-400 font-sans leading-relaxed">
                <strong className="text-gray-200 block font-mono text-xs mb-1">
                  PARAMETER PEMBATAS SIKLUS TERAPI:
                </strong>
                Siklus standar penebusan adalah <span className="text-cyan-300 font-mono">{selectedMed.refillCycleDays} hari kalender</span>. Penebusan &lt; 80% dari batas siklus memicu sinyal peringatan <em>early refill window compression</em>.
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#142232] flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/terminal/network?focus=${selectedMed.id}`)}
                  className="px-3 py-1.5 bg-[#0a1420] hover:bg-[#112338] text-gray-300 hover:text-cyan-300 border border-[#1a2d42] rounded-[2px] text-xs transition-colors flex items-center gap-1"
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Graf Persebaran</span>
                </button>
                <button
                  onClick={() => navigate(`/terminal/alerts?severity=HIGH`)}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold rounded-[2px] text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>LIHAT ALERT TERKAIT</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-6 text-center text-gray-500">
              Pilih obat untuk menampilkan profil risiko.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
