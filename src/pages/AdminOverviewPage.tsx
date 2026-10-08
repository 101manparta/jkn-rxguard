import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import {
  Sliders,
  Users,
  Shield,
  Activity,
  FileCode2,
  Cpu,
  Database,
  Terminal,
  LogOut,
  Plus,
  Edit2,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  Radio,
} from 'lucide-react';
import { DataDisclaimerBanner } from '../components/common/DataDisclaimerBanner';

export const AdminOverviewPage: React.FC = () => {
  const {
    currentUser,
    logout,
    systemUsers,
    toggleUserStatus,
    riskRules,
    updateRiskRule,
    auditLogs,
  } = useTerminal();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'rules' | 'users' | 'health' | 'audit'>('rules');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingWeight, setEditingWeight] = useState<number>(20);
  const [feedback, setFeedback] = useState<string>('');

  const handleSaveRuleWeight = (id: string) => {
    updateRiskRule(id, { weight: editingWeight });
    setEditingRuleId(null);
    setFeedback(`Bobot rule ${id} berhasil diperbarui menjadi ${editingWeight} poin.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleToggleRuleStatus = (id: string, currentStatus: 'ACTIVE' | 'DISABLED') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    updateRiskRule(id, { status: nextStatus });
    setFeedback(`Status rule ${id} diubah menjadi [${nextStatus}].`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-gray-200 font-mono text-xs flex flex-col">
      <DataDisclaimerBanner compact={true} />

      {/* Admin Top Header */}
      <header className="border-b border-[#1b2636] bg-[#070b12] px-4 py-2 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-[1px]"></span>
            <span className="font-bold tracking-wider text-gray-100 text-sm">RXGUARD</span>
            <span className="text-amber-400 font-bold border-l border-[#223348] pl-2">
              ADMIN CONTROL CENTER
            </span>
          </div>
          <span className="text-gray-500 hidden md:inline">| KONTROL ATURAN & AKSES SISTEM</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-300 bg-[#0e1724] border border-[#1e2f47] px-2 py-0.5 rounded-[2px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-amber-400">{currentUser?.username || 'admin.demo'}</span>
            <span className="text-gray-500 text-[10px]">(ADMINISTRATOR)</span>
          </div>

          <button
            onClick={() => navigate('/terminal/overview')}
            className="text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-[#0b1726] border border-cyan-800/60 rounded-[2px] transition-colors flex items-center gap-1"
          >
            <span>Buka Analyst Terminal</span>
            <ArrowRight className="w-3 h-3" />
          </button>

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
      </header>

      {/* Admin Tabs */}
      <div className="border-b border-[#142131] bg-[#080d14] px-4 py-1.5 flex items-center gap-2">
        {[
          { id: 'rules', label: 'RISK RULES ENGINE', icon: Sliders },
          { id: 'users', label: 'USER & ROLE MANAGEMENT', icon: Users },
          { id: 'health', label: 'SYSTEM HEALTH & TELEMETRY', icon: Activity },
          { id: 'audit', label: 'ADMIN AUDIT TRAIL', icon: FileCode2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-[2px] border flex items-center gap-1.5 font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-950/70 text-amber-300 border-amber-600/70'
                  : 'bg-transparent text-gray-400 border-transparent hover:bg-[#0c1420] hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Body */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto space-y-4">
        {feedback && (
          <div className="p-2.5 bg-emerald-950/50 border border-emerald-700 text-emerald-300 rounded-[2px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* TAB 1: RISK RULES ENGINE */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#142131]">
              <div>
                <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
                  KONFIGURASI ATURAN RISIKO & PEMBOBOTAN
                </h2>
                <p className="text-gray-400 text-xs font-sans mt-0.5">
                  Aturan bisnis ini dieksekusi secara real-time pada setiap batch penyerapan klaim.
                </p>
              </div>
            </div>

            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Rule Code & Name</th>
                      <th className="py-2.5 px-3">Deskripsi Algoritma</th>
                      <th className="py-2.5 px-3 text-center">Bobot (Weight)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Pembaruan Terakhir</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#121c29]">
                    {riskRules.map((rule) => {
                      const isEditing = editingRuleId === rule.id;
                      return (
                        <tr key={rule.id} className="hover:bg-[#0c1420] transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-gray-200 block">{rule.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{rule.code}</span>
                          </td>
                          <td className="py-3 px-3 max-w-md text-gray-300 font-sans text-xs">
                            {rule.description}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isEditing ? (
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editingWeight}
                                  onChange={(e) => setEditingWeight(Number(e.target.value))}
                                  className="w-16 bg-[#05080e] border border-cyan-500 text-cyan-300 px-1 py-0.5 text-center font-bold font-mono rounded-[2px]"
                                />
                                <button
                                  onClick={() => handleSaveRuleWeight(rule.id)}
                                  className="px-2 py-0.5 bg-cyan-600 text-gray-950 font-bold rounded-[2px]"
                                >
                                  Simpan
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-cyan-400 bg-[#0d1c2d] px-2 py-0.5 border border-cyan-800/60 rounded-[2px]">
                                {rule.weight} Poin
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-bold ${
                                rule.status === 'ACTIVE'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                                  : 'bg-gray-800 text-gray-400 border-gray-700'
                              }`}
                            >
                              {rule.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                            <div>{rule.lastUpdated}</div>
                            <span className="text-[10px] text-gray-500">Oleh: {rule.updatedBy}</span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingRuleId(rule.id);
                                  setEditingWeight(rule.weight);
                                }}
                                className="px-2 py-1 bg-[#0d1624] hover:bg-[#142338] text-gray-300 hover:text-cyan-300 border border-[#1b2b3d] rounded-[2px] text-[11px] transition-colors"
                              >
                                Edit Bobot
                              </button>
                              <button
                                onClick={() => handleToggleRuleStatus(rule.id, rule.status)}
                                className={`px-2 py-1 border rounded-[2px] text-[11px] transition-colors ${
                                  rule.status === 'ACTIVE'
                                    ? 'bg-red-950/40 text-red-400 border-red-800 hover:bg-red-900/60'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                                }`}
                              >
                                {rule.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER & ROLE MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#142131]">
              <div>
                <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
                  PENGELOLAAN PENGGUNA & HAK AKSES
                </h2>
                <p className="text-gray-400 text-xs font-sans mt-0.5">
                  Pengaturan akun personel analis dan administrator terminal.
                </p>
              </div>

              <button
                onClick={() => {
                  setFeedback('Fitur pendaftaran akun baru dibatasi untuk security compliance environment.');
                  setTimeout(() => setFeedback(''), 3000);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold rounded-[2px] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>CREATE USER</span>
              </button>
            </div>

            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Login Terakhir</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121c29]">
                  {systemUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0c1420] transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-200">
                        {u.username}
                        <span className="block text-[10px] text-gray-500 font-mono">{u.id}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-sans text-xs">
                        {u.name}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : u.role === 'AUDITOR'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                              : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                              : 'bg-red-950/60 text-red-400 border-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-[11px]">
                        {u.lastLogin}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setFeedback(`Profil pengguna ${u.username} dalam sinkronisasi direktori.`);
                              setTimeout(() => setFeedback(''), 3000);
                            }}
                            className="px-2 py-1 bg-[#0d1624] hover:bg-[#142338] text-gray-300 border border-[#1b2b3d] rounded-[2px] text-[11px]"
                          >
                            EDIT USER
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2 py-1 border rounded-[2px] text-[11px] ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-950/40 text-red-400 border-red-800 hover:bg-red-900/60'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'DISABLE USER' : 'ENABLE USER'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#142131]">
              <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
                STATUS KESEHATAN SISTEM & TELEMETRI ENGINE
              </h2>
              <p className="text-gray-400 text-xs font-sans mt-0.5">
                Monitoring ketersediaan layanan mikro, latensi transaksi, dan pipeline pembelajaran mesin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'API REST SERVICE', status: 'ONLINE', latency: '18ms', uptime: '99.99%', load: '14%' },
                { name: 'DATABASE POSTGRESQL CLUSTER', status: 'ONLINE', latency: '4ms', uptime: '99.98%', load: '32%' },
                { name: 'REDIS CACHE & QUEUE', status: 'ONLINE', latency: '1ms', uptime: '100%', load: '8%' },
                { name: 'RISK INFERENCE ENGINE', status: 'ONLINE', latency: '42ms', uptime: '99.95%', load: '45%' },
                { name: 'NETWORK GRAPH ENGINE (Cytoscape Backend)', status: 'ONLINE', latency: '65ms', uptime: '99.92%', load: '58%' },
                { name: 'ML ANOMALY MODEL (Random Forest v2.4)', status: 'ONLINE', latency: '110ms', uptime: '99.88%', load: '62%' },
              ].map((sub, i) => (
                <div key={i} className="p-4 bg-[#080d14] border border-[#1a283a] rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-200 text-xs">{sub.name}</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-950/60 px-2 py-0.5 border border-emerald-800 rounded-[2px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#131d2b] text-[10px]">
                    <div>
                      <span className="text-gray-500 block">LATENSI</span>
                      <span className="text-cyan-400 font-bold">{sub.latency}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">UPTIME 30H</span>
                      <span className="text-gray-200 font-bold">{sub.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">LOAD CPU</span>
                      <span className="text-amber-400 font-bold">{sub.load}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#142131]">
              <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
                ADMIN LOG AKTIVITAS SISTEM
              </h2>
              <button
                onClick={() => navigate('/terminal/audit')}
                className="text-cyan-400 hover:underline text-xs"
              >
                Buka Halaman Audit Lengkap →
              </button>
            </div>

            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0b131f] border-b border-[#172538] text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3 text-center">Hasil</th>
                    <th className="py-2.5 px-3">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121c29]">
                  {auditLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-[#0c1420]">
                      <td className="py-2.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300 text-[11px]">
                        {log.user}
                      </td>
                      <td className="py-2.5 px-3 text-gray-200 font-semibold text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-blue-300 text-[11px]">{log.resource}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {log.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 font-sans text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
