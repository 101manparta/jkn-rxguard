import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { Facility } from '../types';
import {
  Building2,
  Search,
  ArrowUpRight,
  ShieldAlert,
  MapPin,
  Calendar,
  Network,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { RiskScoreBadge } from '../components/common/StatusBadge';

export const FacilitiesPage: React.FC = () => {
  const { facilities, alerts } = useTerminal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(() => {
    if (initialId) {
      const match = facilities.find((f) => f.id.toUpperCase() === initialId.toUpperCase());
      if (match) return match;
    }
    return facilities[0]; // FKTP0182
  });

  const [searchQuery, setSearchQuery] = useState(initialId);

  const filteredFacilities = facilities.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      f.region.toLowerCase().includes(q)
    );
  });

  const facilityAlerts = selectedFacility
    ? alerts.filter((a) => a.facilityId === selectedFacility.id)
    : [];

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            FACILITY INTELLIGENCE
          </h1>
          <span className="text-gray-500">| AUDIT FASILITAS KESEHATAN (FKTP & FKRTL)</span>
        </div>
        <div className="text-gray-400">
          TEREGISTRASI: <strong className="text-blue-400">{facilities.length} ENTITAS FASKES</strong>
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
              placeholder="Cari kode faskes (cth: FKTP0182), nama faskes, rayon..."
              className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-hidden text-xs font-mono"
            />
          </div>

          {/* Table */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Kode Faskes</th>
                    <th className="py-2.5 px-3">Nama Faskes</th>
                    <th className="py-2.5 px-3">Tipe Layanan</th>
                    <th className="py-2.5 px-3 text-center">Total Klaim</th>
                    <th className="py-2.5 px-3 text-center">Event Risiko</th>
                    <th className="py-2.5 px-3 text-center">Skor</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121c29]">
                  {filteredFacilities.map((f) => {
                    const isSelected = selectedFacility?.id === f.id;
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFacility(f)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#101a28] border-l-2 border-blue-400' : 'hover:bg-[#0c1420]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-blue-300 group-hover:text-blue-200">
                          {f.id}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-gray-200 text-xs">
                          {f.name}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                          {f.type}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-300 font-bold">
                          {f.transactionCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-center text-red-400 font-bold">
                          {f.riskEvents}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <RiskScoreBadge score={f.riskScore} />
                        </td>
                        <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded-[2px] border ${
                              f.status === 'Audit Khusus'
                                ? 'bg-red-950/60 text-red-400 border-red-800'
                                : f.status === 'Pengawasan'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                            }`}
                          >
                            {f.status}
                          </span>
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
          {selectedFacility ? (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#142232]">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    PROFIL FASILITAS KESEHATAN
                  </div>
                  <h2 className="text-xl font-bold text-blue-300 mt-0.5">{selectedFacility.id}</h2>
                  <p className="text-xs text-gray-200 font-sans mt-0.5">{selectedFacility.name}</p>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{selectedFacility.region} • {selectedFacility.type}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block mb-1">SKOR ANOMALI</span>
                  <RiskScoreBadge score={selectedFacility.riskScore} />
                </div>
              </div>

              {/* Status & Inspection */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-[#0a121e] border border-[#162538] rounded-[2px]">
                  <span className="text-gray-500 block text-[10px]">STATUS PENGAWASAN</span>
                  <span className="text-gray-200 font-bold">{selectedFacility.status}</span>
                </div>
                <div className="p-2.5 bg-[#0a121e] border border-[#162538] rounded-[2px]">
                  <span className="text-gray-500 block text-[10px]">INSPEKSI TERAKHIR</span>
                  <span className="text-cyan-400 font-bold">{selectedFacility.lastInspection}</span>
                </div>
              </div>

              {/* Distribution Stats */}
              <div>
                <div className="text-[11px] text-gray-400 uppercase font-semibold mb-2">
                  DISTRIBUSI KLAIM BERISIKO:
                </div>
                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex items-center justify-between p-2 bg-[#0a111a] border border-[#142030] rounded-[2px]">
                    <span className="text-gray-300">Konsentrasi Peresepan Obat MEDX</span>
                    <span className="font-mono text-amber-400 font-bold">58% Total Kuota</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0a111a] border border-[#142030] rounded-[2px]">
                    <span className="text-gray-300">Overlap Rujukan ke FKTP0291</span>
                    <span className="font-mono text-red-400 font-bold">68% Kesamaan Peserta</span>
                  </div>
                </div>
              </div>

              {/* Linked Alert History */}
              <div className="pt-2 border-t border-[#142232]">
                <div className="text-[11px] text-gray-400 uppercase font-semibold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>NOTIFIKASI TERHUBUNG KE FASKES:</span>
                  </span>
                  <span className="text-cyan-400">{facilityAlerts.length} Alert</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {facilityAlerts.length > 0 ? (
                    facilityAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => navigate(`/terminal/alerts?id=${alt.id}`)}
                        className="p-2 bg-[#0a121e] hover:bg-[#122238] border border-[#16283d] rounded-[2px] cursor-pointer text-[11px] flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-gray-200 group-hover:text-cyan-300">
                            {alt.id} - {alt.riskType}
                          </div>
                          <span className="text-gray-400 text-[10px] font-sans">
                            {alt.entityId} • {alt.timestamp.split(' ')[0]}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-3">
                      Tidak ada alert aktif pada faskes ini saat ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#142232] flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/terminal/network?focus=${selectedFacility.id}`)}
                  className="px-3 py-1.5 bg-[#0a1420] hover:bg-[#112338] text-gray-300 hover:text-cyan-300 border border-[#1a2d42] rounded-[2px] text-xs transition-colors flex items-center gap-1"
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Graf Relasi Faskes</span>
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
              Pilih faskes untuk menampilkan rincian audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
