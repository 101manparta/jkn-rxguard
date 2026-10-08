import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import { AlertStatus } from '../types';
import {
  FileText,
  ShieldAlert,
  Clock,
  Layers,
  Building,
  Pill,
  Send,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  User,
  Share2,
} from 'lucide-react';
import { RiskScoreBadge, StatusBadge } from '../components/common/StatusBadge';

export const InvestigationPage: React.FC = () => {
  const { investigations, updateInvestigationStatus, addInvestigationNote } = useTerminal();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeId = searchParams.get('id') || 'INV0281';
  const investigation = investigations[activeId] || investigations['INV0281'];

  const [newNote, setNewNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleDecision = (status: AlertStatus) => {
    updateInvestigationStatus(investigation.id, status);
    setFeedbackMessage(`Status investigasi diperbarui menjadi [${status}] pada audit trail.`);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addInvestigationNote(investigation.id, newNote);
    setNewNote('');
  };

  const availableIds = Object.keys(investigations);

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title & Case Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            INVESTIGATION WORKBENCH
          </h1>
          <span className="text-gray-500">| VERIFIKASI BUKTI & PENGAMBILAN KEPUTUSAN</span>
        </div>

        {/* Case Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-gray-500 uppercase mr-1">BERKAS AKTIF:</span>
          {availableIds.map((id) => (
            <button
              key={id}
              onClick={() => setSearchParams({ id })}
              className={`px-2.5 py-1 rounded-[2px] border text-[11px] transition-colors ${
                investigation.id === id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-[#080d14] border border-[#1a283a] p-4 rounded-[2px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                INVESTIGATION FILE ID
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-[11px]">Ref Alert: {investigation.alertId}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
                {investigation.id}
              </h2>
              <span className="text-sm font-semibold text-cyan-300 bg-[#0e1b2b] px-2 py-0.5 border border-cyan-800/60 rounded-[2px]">
                Target: {investigation.targetParticipantId}
              </span>
              <StatusBadge status={investigation.status} />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2 font-sans">
              <span>Dibuka: <strong className="text-gray-200 font-mono">{investigation.openedAt}</strong></span>
              <span>Analis PJ: <strong className="text-cyan-400 font-mono">{investigation.assignedTo}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block mb-1">TOTAL RISK SCORE</span>
              <RiskScoreBadge
                score={investigation.riskScore}
                level={investigation.riskLevel}
              />
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 rounded-[2px] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Evidence Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-3 bg-[#080d14] border border-[#182738] rounded-[2px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">TRANSAKSI DIANALISIS</span>
          <span className="text-xl font-bold text-gray-100">
            {investigation.evidence.transactionCount} Transaksi
          </span>
        </div>
        <div className="p-3 bg-[#080d14] border border-[#182738] rounded-[2px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">FASKES TERLIBAT</span>
          <span className="text-xl font-bold text-blue-400">
            {investigation.evidence.facilityCount} Faskes
          </span>
        </div>
        <div className="p-3 bg-[#080d14] border border-[#182738] rounded-[2px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">OBAT BERISIKO</span>
          <span className="text-xl font-bold text-amber-400">
            {investigation.evidence.medicationCount} Macam Obat
          </span>
        </div>
        <div className="p-3 bg-[#080d14] border border-[#182738] rounded-[2px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">JENDELA WAKTU SIKLUS</span>
          <span className="text-xl font-bold text-cyan-400">
            {investigation.evidence.timeframeDays} Hari Kalender
          </span>
        </div>
      </div>

      {/* Main 2-Column Split: Left (Risk Signals + Timeline) | Right (Decision + Network + Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Risk Signals Additive Breakdown */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#142131]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider">
                  KOMPOSISI BOBOT SINYAL RISIKO (RISK SIGNALS)
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Model: Additive Scoring</span>
            </div>

            <div className="space-y-2">
              {investigation.signals.map((sig, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#09111b] border border-[#152335] rounded-[2px] flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-200 text-xs">{sig.label}</div>
                    <div className="text-[11px] text-gray-400 font-sans leading-relaxed">
                      {sig.description}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-cyan-400 bg-[#0f1f33] px-2 py-0.5 border border-cyan-800/60 rounded-[2px] text-xs shrink-0">
                    +{sig.weight}
                  </span>
                </div>
              ))}

              {/* Total Row */}
              <div className="p-2.5 bg-[#0e1724] border border-cyan-800/50 rounded-[2px] flex items-center justify-between font-bold text-xs mt-2">
                <span className="text-gray-200">TOTAL RISK SCORE TERKALIBRASI</span>
                <span className="text-red-400 font-mono text-sm">
                  {investigation.riskScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Chronological Investigation Timeline */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#142131]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider">
                  KRONOLOGI REKAM TRANSAKSI & ANOMALI
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Urutan Waktu Peristiwa</span>
            </div>

            <div className="space-y-3 relative border-l-2 border-[#1c2f47] pl-4 ml-2">
              {investigation.timeline.map((item, i) => {
                let badgeColor = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
                if (item.riskFlagSeverity === 'high') {
                  badgeColor = 'bg-red-950/60 text-red-400 border-red-800/60 font-semibold';
                } else if (item.riskFlagSeverity === 'medium') {
                  badgeColor = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
                }

                return (
                  <div key={i} className="relative space-y-1">
                    {/* Circle marker on border */}
                    <span
                      className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#080d14] ${
                        item.riskFlagSeverity === 'high'
                          ? 'bg-red-500'
                          : item.riskFlagSeverity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                    ></span>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 font-bold">{item.date}</span>
                      <span className="text-gray-500 font-mono text-[10px]">{item.time}</span>
                    </div>

                    <div className="bg-[#09111b] border border-[#142233] p-2.5 rounded-[2px] text-xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-blue-300 font-semibold">{item.facilityName} ({item.facilityId})</span>
                        <span className="text-amber-300 font-mono">Qty: {item.quantity}</span>
                      </div>
                      <div className="text-gray-300 font-sans">
                        Resep: <strong className="text-gray-200 font-mono">{item.medicationName}</strong>
                      </div>

                      {item.flag && (
                        <div className={`mt-2 p-1.5 border rounded-[2px] text-[11px] font-sans ${badgeColor}`}>
                          {item.flag}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Decision Action + Mini Network + Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Decision Workflow Actions Card */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-3">
            <div className="pb-2 border-b border-[#142131]">
              <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>KEPUTUSAN INVESTIGATOR (DECISION WORKFLOW)</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans mt-1 leading-relaxed">
                Prinsip etik: Sistem hanya memberikan indikasi risiko dan membantu verifikasi objektif, <strong>bukan vonis otomatis kecurangan</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleDecision('UNDER REVIEW')}
                className={`py-2 px-3 border rounded-[2px] font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  investigation.status === 'UNDER REVIEW'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 ring-1 ring-cyan-500'
                    : 'bg-[#0a121e] hover:bg-[#122338] text-cyan-400 border-cyan-900/60'
                }`}
              >
                <span>UNDER REVIEW</span>
              </button>

              <button
                onClick={() => handleDecision('ESCALATED')}
                className={`py-2 px-3 border rounded-[2px] font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  investigation.status === 'ESCALATED'
                    ? 'bg-red-950 text-red-300 border-red-500 ring-1 ring-red-500'
                    : 'bg-[#0a121e] hover:bg-[#1a0f0f] text-red-400 border-red-900/60'
                }`}
              >
                <span>ESCALATE</span>
              </button>

              <button
                onClick={() => handleDecision('RESOLVED')}
                className={`py-2 px-3 border rounded-[2px] font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  investigation.status === 'RESOLVED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-[#0a121e] hover:bg-[#0f1d18] text-emerald-400 border-emerald-900/60'
                }`}
              >
                <span>CONFIRM ANOMALY</span>
              </button>

              <button
                onClick={() => handleDecision('FALSE POSITIVE')}
                className={`py-2 px-3 border rounded-[2px] font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  investigation.status === 'FALSE POSITIVE'
                    ? 'bg-gray-800 text-gray-200 border-gray-500 ring-1 ring-gray-400'
                    : 'bg-[#0a121e] hover:bg-[#161a20] text-gray-400 border-gray-700/60'
                }`}
              >
                <span>FALSE POSITIVE</span>
              </button>
            </div>
          </div>

          {/* Mini Network Topology Snapshot */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#142131]">
              <span className="font-bold text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>TOPOLOGI JARINGAN KLASTER KASUS</span>
              </span>
              <button
                onClick={() => navigate(`/terminal/network?focus=${investigation.targetParticipantId}`)}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-0.5"
              >
                <span>Perbesar Graf</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 bg-[#05080e] border border-[#152336] rounded-[2px] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Node Inti (Target):</span>
                <span className="text-cyan-300 font-bold">{investigation.targetParticipantId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Faskes Terkoneksi:</span>
                <span className="text-blue-400">FKTP0182, FKTP0291, FKTP0301, FKRTL0045</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Substansi Obat:</span>
                <span className="text-amber-400">MEDX, MEDY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Korelasi Resep Sindikasi:</span>
                <span className="text-purple-400">RX18291 (Derajat Relasi: 6)</span>
              </div>
            </div>
          </div>

          {/* Investigator Notes & Action History */}
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-4 space-y-3">
            <div className="pb-2 border-b border-[#142131] flex items-center justify-between">
              <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                <span>CATATAN TIM AUDITOR & INVESTIGASI</span>
              </h3>
              <span className="text-[10px] text-gray-500">{investigation.notes.length} Catatan</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {investigation.notes.length > 0 ? (
                investigation.notes.map((note) => (
                  <div key={note.id} className="p-2.5 bg-[#09111b] border border-[#162538] rounded-[2px] text-xs">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span className="text-cyan-400 font-bold">{note.author}</span>
                      <span>{note.timestamp}</span>
                    </div>
                    <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-3 text-xs">
                  Belum ada catatan verifikator untuk berkas ini.
                </div>
              )}
            </div>

            {/* Note entry form */}
            <form onSubmit={handleAddNote} className="pt-2 border-t border-[#142131] space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Tambahkan catatan verifikasi rekam medis, klarifikasi faskes, atau audit lapangan..."
                rows={2}
                className="w-full bg-[#05080e] border border-[#1b2b3d] text-gray-200 p-2 text-xs rounded-[2px] focus:outline-hidden focus:border-cyan-500 font-sans"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-1.5 bg-[#101f30] hover:bg-cyan-600 hover:text-gray-950 disabled:opacity-40 text-cyan-300 border border-cyan-800/60 rounded-[2px] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
