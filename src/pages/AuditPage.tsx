import React, { useState } from 'react';
import { useTerminal } from '../context/TerminalContext';
import {
  FileCode2,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { auditLogs } = useTerminal();
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (userFilter !== 'ALL' && log.user !== userFilter) return false;
    if (actionFilter !== 'ALL' && !log.action.includes(actionFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = (format: 'json' | 'csv') => {
    const dataStr =
      format === 'json'
        ? JSON.stringify(filteredLogs, null, 2)
        : 'ID,Timestamp,User,Action,Resource,Result,Details\n' +
          filteredLogs
            .map(
              (l) =>
                `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.resource}","${l.result}","${l.details.replace(/"/g, '""')}"`
            )
            .join('\n');

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_rxguard_${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            IMMUTABLE AUDIT TRAIL
          </h1>
          <span className="text-gray-500">| LOG AKTIVITAS & KEPATUHAN AKSES TERMINAL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-2.5 py-1 bg-[#0c1522] hover:bg-[#132338] text-gray-300 hover:text-cyan-300 border border-[#1b2b3e] rounded-[2px] transition-colors flex items-center gap-1.5 text-[11px]"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-2.5 py-1 bg-[#0c1522] hover:bg-[#132338] text-gray-300 hover:text-cyan-300 border border-[#1b2b3e] rounded-[2px] transition-colors flex items-center gap-1.5 text-[11px]"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#080d14] border border-[#1a283a] p-3 rounded-[2px] grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari user, action, resource, atau detail log..."
            className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-200 pl-8 pr-3 py-1.5 text-xs rounded-[2px] focus:outline-hidden focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-300 px-2 py-1.5 rounded-[2px] focus:outline-hidden focus:border-cyan-500"
          >
            <option value="ALL">Semua User</option>
            <option value="ANALYST001">ANALYST001</option>
            <option value="ANALYST002">ANALYST002</option>
            <option value="ADMIN001">ADMIN001</option>
            <option value="AUDITOR003">AUDITOR003</option>
            <option value="SYSTEM_RISK_ENGINE">SYSTEM_RISK_ENGINE</option>
          </select>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-300 px-2 py-1.5 rounded-[2px] focus:outline-hidden focus:border-cyan-500"
          >
            <option value="ALL">Semua Tipe Aksi</option>
            <option value="VIEW">VIEW (Akses Pembacaan)</option>
            <option value="UPDATE">UPDATE (Perubahan Data/Status)</option>
            <option value="SEARCH">SEARCH (Kueri Terminal)</option>
            <option value="AUTH">AUTHENTICATION (Sesi Akses)</option>
            <option value="EMIT">EMIT (Peringatan Otomatis Engine)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Timestamp (WITA)</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3 text-center">Hasil</th>
                <th className="py-2.5 px-3">Rincian Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121c29]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#0c1420] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-cyan-300 bg-[#0e1b2b] px-1.5 py-0.5 border border-cyan-800/60 rounded-[2px] text-[11px]">
                      {log.user}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-200 text-[11px] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-blue-300 text-[11px] whitespace-nowrap font-mono">
                    {log.resource}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold border ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/70'
                          : log.result === 'DENIED'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/70'
                          : 'bg-red-950/60 text-red-400 border-red-800/70'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-300 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
