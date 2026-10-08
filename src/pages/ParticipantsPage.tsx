import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { Participant } from '../types';
import {
  Users,
  Search,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Layers,
  Building,
  Pill,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { RiskScoreBadge } from '../components/common/StatusBadge';

export const ParticipantsPage: React.FC = () => {
  const { participants, facilities, medications } = useTerminal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(() => {
    if (initialId) {
      const match = participants.find((p) => p.id.toUpperCase() === initialId.toUpperCase());
      if (match) return match;
    }
    return participants[0]; // P00182
  });

  const [searchQuery, setSearchQuery] = useState(initialId);

  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.signals.some((s) => s.toLowerCase().includes(q)) ||
      p.riskLevel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            PARTICIPANT INTELLIGENCE
          </h1>
          <span className="text-gray-500">| ENTITAS PESERTA PSEUDONYM</span>
        </div>
        <div className="text-gray-400">
          PROTEKSI: <strong className="text-cyan-400">TIDAK ADA NIK / IDENTITAS ASLI</strong>
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
              placeholder="Cari ID Peserta (cth: P00182) atau jenis sinyal risiko..."
              className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-hidden text-xs font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Participant ID</th>
                    <th className="py-2.5 px-3 text-center">Skor Risiko</th>
                    <th className="py-2.5 px-3">Tingkat</th>
                    <th className="py-2.5 px-3 text-center">Faskes</th>
                    <th className="py-2.5 px-3 text-center">Event Obat</th>
                    <th className="py-2.5 px-3">Aktivitas Terakhir</th>
                    <th className="py-2.5 px-3 text-right">Pilih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121c29]">
                  {filteredParticipants.map((p) => {
                    const isSelected = selectedParticipant?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedParticipant(p)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#0f1d2e] border-l-2 border-cyan-400' : 'hover:bg-[#0c1420]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-cyan-300 group-hover:text-cyan-200">
                          {p.id}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <RiskScoreBadge score={p.riskScore} />
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] text-gray-300 font-semibold">{p.riskLevel}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-blue-400 font-bold">
                          {p.facilitiesCount}
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-400 font-bold">
                          {p.medicationEvents}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                          {p.lastActivity}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(p);
                            }}
                            className="text-gray-400 group-hover:text-cyan-400 p-1"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
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
          {selectedParticipant ? (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#142232]">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    PROFIL RISIKO PESERTA (PSEUDONYM)
                  </div>
                  <h2 className="text-xl font-bold text-gray-100 mt-0.5">{selectedParticipant.id}</h2>
                  <span className="text-xs text-cyan-400 mt-0.5 block">
                    Status Audit: {selectedParticipant.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block mb-1">SCORE TOTAL</span>
                  <RiskScoreBadge
                    score={selectedParticipant.riskScore}
                    level={selectedParticipant.riskLevel}
                  />
                </div>
              </div>

              {/* Signals breakdown */}
              <div>
                <div className="text-[11px] text-gray-400 uppercase font-semibold mb-2">
                  SINYAL ANOMALI TERDETEKSI:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedParticipant.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#0e1b2b] text-cyan-300 border border-cyan-800/60 rounded-[2px] text-xs"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connected Facilities & Medications */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#142232]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>Faskes Terkait:</span>
                  </div>
                  <div className="space-y-1">
                    {selectedParticipant.associatedFacilities.map((fid) => (
                      <div
                        key={fid}
                        onClick={() => navigate(`/terminal/facilities?id=${fid}`)}
                        className="text-blue-300 bg-[#0a121e] hover:bg-[#122338] px-2 py-1 rounded-[2px] border border-[#16293f] cursor-pointer text-[11px] transition-colors flex items-center justify-between"
                      >
                        <span>{fid}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-amber-400" />
                    <span>Obat Terkait:</span>
                  </div>
                  <div className="space-y-1">
                    {selectedParticipant.associatedMedications.map((mid) => (
                      <div
                        key={mid}
                        onClick={() => navigate(`/terminal/medications?id=${mid}`)}
                        className="text-amber-300 bg-[#0a121e] hover:bg-[#122338] px-2 py-1 rounded-[2px] border border-[#16293f] cursor-pointer text-[11px] transition-colors flex items-center justify-between"
                      >
                        <span>{mid}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Timeline */}
              <div className="pt-2 border-t border-[#142232]">
                <div className="text-[11px] text-gray-400 uppercase font-semibold mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>KRONOLOGI PERESEPAN 30 HARI TERAKHIR:</span>
                </div>
                <div className="space-y-2 border-l border-[#1c2c3e] pl-3 ml-1 text-[11px] font-sans">
                  <div>
                    <span className="text-gray-500 font-mono text-[10px]">18 OKT 2026</span>
                    <p className="text-gray-200">
                      Penebusan resep MEDY di FKTP0182 (Early refill cycle flag)
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[10px]">07 OKT 2026</span>
                    <p className="text-gray-200">
                      Penebusan resep MEDX di FKTP0301 (Volume 90 tablet)
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[10px]">01 OKT 2026</span>
                    <p className="text-gray-200">
                      Penebusan awal MEDX di FKTP0182 (Volume 60 tablet)
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#142232] flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/terminal/network?focus=${selectedParticipant.id}`)}
                  className="px-3 py-1.5 bg-[#0a1420] hover:bg-[#112338] text-gray-300 hover:text-cyan-300 border border-[#1a2d42] rounded-[2px] text-xs transition-colors flex items-center gap-1"
                >
                  <span>Graf Relasi</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate('/terminal/investigations?id=INV0281')}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold rounded-[2px] text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>BUKA INVESTIGASI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-6 text-center text-gray-500">
              Pilih peserta untuk menampilkan profil intelijen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
