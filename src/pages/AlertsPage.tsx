import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { RiskAlert, AlertSeverity, AlertStatus } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { SeverityBadge, StatusBadge, RiskScoreBadge } from '../components/common/StatusBadge';

export const AlertsPage: React.FC = () => {
  const { alerts, facilities, medications } = useTerminal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [severityFilter, setSeverityFilter] = useState<string>(
    searchParams.get('severity') || 'ALL'
  );
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [medFilter, setMedFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (facilityFilter !== 'ALL' && item.facilityId !== facilityFilter) return false;
      if (medFilter !== 'ALL' && item.medicationId !== medFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.entityId.toLowerCase().includes(q) ||
          item.riskType.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.facilityId.toLowerCase().includes(q) ||
          item.medicationId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [alerts, severityFilter, facilityFilter, medFilter, statusFilter, searchQuery]);

  const resetFilters = () => {
    setSeverityFilter('ALL');
    setFacilityFilter('ALL');
    setMedFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            RISK ALERTS
          </h1>
          <span className="text-gray-500">| DAFTAR ANOMALI PELAYANAN & RESEP TERDETEKSI</span>
        </div>
        <div className="text-xs text-gray-400">
          TOTAL TERCATAT: <strong className="text-cyan-400 font-bold">{alerts.length}</strong> | TERFILTER: <strong className="text-gray-200">{filteredAlerts.length}</strong>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-[#080d14] border border-[#1a283a] p-3 rounded-[2px] space-y-3">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500 uppercase mr-1">Tingkat Risiko:</span>
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'HIGH', label: 'High' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'LOW', label: 'Low' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeverityFilter(tab.id)}
                className={`px-2.5 py-1 rounded-[2px] border text-[11px] transition-colors ${
                  severityFilter === tab.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alert ID, entity, jenis risiko..."
              className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-200 pl-8 pr-3 py-1.5 text-xs rounded-[2px] focus:outline-hidden focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#131d2b] text-[11px]">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Fasilitas (Faskes):</label>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-300 px-2 py-1 rounded-[2px] focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">Semua Faskes</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} - {f.name.substring(0, 20)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Obat / Substansi:</label>
            <select
              value={medFilter}
              onChange={(e) => setMedFilter(e.target.value)}
              className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-300 px-2 py-1 rounded-[2px] focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">Semua Obat</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} ({m.name.substring(0, 15)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Status Penanganan:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-300 px-2 py-1 rounded-[2px] focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="OPEN">OPEN</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="FALSE POSITIVE">FALSE POSITIVE</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-1 bg-[#0d1624] hover:bg-[#142338] text-gray-400 hover:text-cyan-300 border border-[#1a2c42] rounded-[2px] flex items-center justify-center gap-1 transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dense Operational Table */}
      <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Jenis Risiko & Ringkasan</th>
                <th className="py-2.5 px-3">Faskes / Obat</th>
                <th className="py-2.5 px-3 text-center">Tingkat</th>
                <th className="py-2.5 px-3 text-center">Skor</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121c29]">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#0c1420] transition-colors group cursor-pointer"
                    onClick={() => {
                      if (item.investigationId) {
                        navigate(`/terminal/investigations?id=${item.investigationId}`);
                      } else {
                        navigate(`/terminal/investigations?id=INV0281`);
                      }
                    }}
                  >
                    <td className="py-2.5 px-3 font-bold text-gray-200 group-hover:text-cyan-400">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-cyan-300 bg-[#0e1b2b] px-1.5 py-0.5 border border-cyan-800/60 rounded-[2px] text-[11px]">
                        {item.entityId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-md">
                      <div className="font-semibold text-gray-200">{item.riskType}</div>
                      <p className="text-[11px] text-gray-400 font-sans line-clamp-1 leading-normal">
                        {item.summary}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                      <div className="text-blue-400">{item.facilityId}</div>
                      <div className="text-amber-400">{item.medicationId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <SeverityBadge severity={item.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-gray-200">{item.riskScore}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.investigationId) {
                            navigate(`/terminal/investigations?id=${item.investigationId}`);
                          } else {
                            navigate(`/terminal/investigations?id=INV0281`);
                          }
                        }}
                        className="px-2.5 py-1 bg-[#101e30] hover:bg-cyan-600 hover:text-gray-950 text-cyan-300 border border-cyan-800/70 rounded-[2px] text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Investigasi</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Tidak ada notifikasi risiko yang memenuhi kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
