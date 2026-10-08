import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerminal } from '../context/TerminalContext';
import {
  CytoscapeGraph,
} from '../components/network/CytoscapeGraph';
import {
  NETWORK_NODES,
  NETWORK_EDGES,
} from '../data/mockData';
import {
  NetworkNodeData,
  RiskAlert,
} from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Network,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  X,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SeverityBadge, RiskScoreBadge } from '../components/common/StatusBadge';

export const AnalystOverviewPage: React.FC = () => {
  const { alerts, participants, medications, facilities, investigations } = useTerminal();
  const navigate = useNavigate();

  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(NETWORK_NODES[0]); // default selected P00182
  const [networkFilter, setNetworkFilter] = useState<string>('all');

  // Find linked entity information for the selected node
  const getSelectedNodeDetails = () => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'participant') {
      const p = participants.find((item) => item.id === selectedNode.id);
      return {
        id: selectedNode.id,
        type: 'PARTICIPANT',
        typeLabel: 'Peserta JKN (Pseudonym)',
        score: p?.riskScore || selectedNode.riskScore,
        level: p?.riskLevel || 'TINGGI',
        signals: p?.signals || ['Early refill', 'Cross facility', 'Quantity anomaly', 'Network correlation'],
        connectedCount: p?.facilitiesCount ? `${p.facilitiesCount} Faskes Terkait` : '4 Faskes Terkait',
        targetRoute: `/terminal/participants?id=${selectedNode.id}`,
        investigationId: 'INV0281',
      };
    } else if (selectedNode.type === 'facility') {
      const f = facilities.find((item) => item.id === selectedNode.id);
      return {
        id: selectedNode.id,
        type: 'FACILITY',
        typeLabel: f?.name || 'Fasilitas Kesehatan',
        score: f?.riskScore || selectedNode.riskScore,
        level: f?.status || 'Audit Khusus',
        signals: [`${f?.riskEvents || 42} kejadian risiko terdata`, 'Dispensasi kuota obat khusus tinggi'],
        connectedCount: `${f?.transactionCount || 3840} Transaksi Klaim`,
        targetRoute: `/terminal/facilities?id=${selectedNode.id}`,
        investigationId: 'INV0281',
      };
    } else if (selectedNode.type === 'medication') {
      const m = medications.find((item) => item.id === selectedNode.id);
      return {
        id: selectedNode.id,
        type: 'MEDICATION',
        typeLabel: m?.name || 'Substansi / Obat Khusus',
        score: m?.riskScore || selectedNode.riskScore,
        level: m?.riskScore && m.riskScore > 80 ? 'TINGGI' : 'SEDANG',
        signals: m?.signals || ['Quantity anomaly', 'Refill pattern', 'Facility concentration'],
        connectedCount: `${m?.facilityCount || 382} Faskes Peresep`,
        targetRoute: `/terminal/medications?id=${selectedNode.id}`,
        investigationId: 'INV0277',
      };
    } else if (selectedNode.type === 'alert') {
      const a = alerts.find((item) => item.id === selectedNode.id);
      return {
        id: selectedNode.id,
        type: 'ALERT',
        typeLabel: a?.riskType || 'Risk Alert Anomaly',
        score: a?.riskScore || selectedNode.riskScore,
        level: a?.severity || 'CRITICAL',
        signals: [a?.summary || 'Pola klaim melampaui batas deviasi statistik'],
        connectedCount: `Faskes: ${a?.facilityId || 'FKTP0182'} • Obat: ${a?.medicationId || 'MEDX'}`,
        targetRoute: `/terminal/alerts?id=${selectedNode.id}`,
        investigationId: a?.investigationId || 'INV0281',
      };
    }
    return {
      id: selectedNode.id,
      type: 'PRESCRIPTION',
      typeLabel: selectedNode.subtitle || 'Berkas Resep Terindikasi',
      score: selectedNode.riskScore,
      level: 'TINGGI',
      signals: ['Polifarmasi tidak sinkron', 'Penebusan berulang'],
      connectedCount: '3 Entitas Terhubung',
      targetRoute: `/terminal/investigations?id=INV0281`,
      investigationId: 'INV0281',
    };
  };

  const details = getSelectedNodeDetails();

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-cyan-400 rounded-[1px]"></span>
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            INTELLIGENCE OVERVIEW
          </h1>
          <span className="text-gray-500 text-xs">| KLASIFIKASI & MATRIKS RISIKO AKTIF</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">STATUS OPERASIONAL:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE MONITORING
          </span>
        </div>
      </div>

      {/* Central Overview Metric Blocks (Bloomberg / SOC density style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
        {/* RISK INDEX */}
        <div className="p-3 bg-[#080d14] border border-[#1a283a] rounded-[2px] relative overflow-hidden">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>RISK INDEX</span>
            <Activity className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 tracking-tight">72.8</div>
          <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-amber-400">▲ +1.4%</span> vs moving avg 7d
          </div>
        </div>

        {/* ACTIVE ALERTS */}
        <div className="p-3 bg-[#080d14] border border-[#1a283a] rounded-[2px] relative overflow-hidden">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>ACTIVE ALERTS</span>
            <ShieldAlert className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-gray-100 tracking-tight">43</div>
          <div className="text-[10px] text-gray-500 mt-1">Perlu tindakan analis</div>
        </div>

        {/* CRITICAL */}
        <div className="p-3 bg-[#080d14] border border-red-900/60 rounded-[2px] relative overflow-hidden bg-red-950/10">
          <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>CRITICAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-red-400 tracking-tight">8</div>
          <div className="text-[10px] text-red-400/80 mt-1">Prioritas tindakan segera</div>
        </div>

        {/* HIGH */}
        <div className="p-3 bg-[#080d14] border border-orange-900/50 rounded-[2px] relative overflow-hidden bg-orange-950/10">
          <div className="text-[10px] text-orange-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>HIGH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
          </div>
          <div className="text-2xl font-bold text-orange-400 tracking-tight">43</div>
          <div className="text-[10px] text-gray-500 mt-1">Dalam proses verifikasi</div>
        </div>

        {/* NETWORK CLUSTERS */}
        <div className="p-3 bg-[#080d14] border border-[#1a283a] rounded-[2px] relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>NETWORK CLUSTERS</span>
            <Network className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">17</div>
          <div className="text-[10px] text-gray-500 mt-1">Klaster terhubung aktif</div>
        </div>
      </div>

      {/* Main Split Area: Left (Network + Detail) | Right (Risk Alert Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: LIVE RISK NETWORK (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
            {/* Header & Filter Controls */}
            <div className="px-3 py-2 bg-[#0a111a] border-b border-[#162334] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-gray-200">LIVE RISK NETWORK</span>
                <span className="text-gray-500 text-[11px] hidden sm:inline">
                  — Interaktif Topologi Sindikasi & Peresepan
                </span>
              </div>

              {/* Node filter pills */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-gray-500 text-[10px] mr-1">Filter:</span>
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'participant', label: 'Peserta' },
                  { id: 'facility', label: 'Fasilitas' },
                  { id: 'medication', label: 'Obat' },
                  { id: 'alert', label: 'Alert' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setNetworkFilter(f.id)}
                    className={`px-2 py-0.5 rounded-[2px] border transition-colors ${
                      networkFilter === f.id
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                        : 'bg-[#060a10] text-gray-400 border-[#1a2838] hover:text-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cytoscape Canvas */}
            <div className="p-2 bg-[#05080e]">
              <CytoscapeGraph
                nodes={NETWORK_NODES}
                edges={NETWORK_EDGES}
                height="440px"
                filterType={networkFilter}
                selectedNodeId={selectedNode?.id}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          </div>

          {/* Node Detail Panel (Shown when node selected) */}
          {details && (
            <div className="bg-[#080e17] border border-[#1b2b3f] p-3.5 rounded-[2px] text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#142232] gap-2">
                <div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <span>{details.type} NODE DETAIL</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{details.connectedCount}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-base font-bold text-gray-100">{details.id}</h3>
                    <span className="text-xs text-gray-400 font-sans">{details.typeLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">RISK SCORE</span>
                    <RiskScoreBadge score={details.score} level={details.level as any} />
                  </div>
                </div>
              </div>

              {/* Signals list */}
              <div className="py-2.5">
                <span className="text-[10px] text-gray-400 block mb-1.5 uppercase tracking-wider font-semibold">
                  SINYAL INDIKASI RISIKO TERDETEKSI:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {details.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#0f1b2b] text-cyan-300 border border-cyan-800/60 rounded-[2px] text-[11px]"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-[#142232] flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => navigate(details.targetRoute)}
                  className="px-3 py-1.5 bg-[#0c1624] hover:bg-[#122238] text-gray-300 hover:text-cyan-300 border border-[#1b2c40] rounded-[2px] text-xs font-mono transition-colors"
                >
                  LIHAT TIMELINE & ENTITAS
                </button>
                <button
                  onClick={() => navigate(`/terminal/investigations?id=${details.investigationId}`)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold rounded-[2px] text-xs font-mono transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>BUKA INVESTIGASI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: RISK ALERT FEED (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-[#0a111a] border-b border-[#162334] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-gray-200">RISK ALERT FEED</span>
              </div>
              <span className="text-[10px] text-gray-400">REAL-TIME</span>
            </div>

            {/* List */}
            <div className="divide-y divide-[#131d2b] max-h-[580px] overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (alert.investigationId) {
                      navigate(`/terminal/investigations?id=${alert.investigationId}`);
                    } else {
                      navigate(`/terminal/alerts?id=${alert.id}`);
                    }
                  }}
                  className="p-3 hover:bg-[#0c1420] cursor-pointer transition-colors group text-xs font-mono"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <span className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">
                        {alert.id}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">{alert.timestamp.split(' ')[0]}</span>
                  </div>

                  <div className="font-semibold text-gray-300 text-xs mb-1">
                    {alert.riskType}
                  </div>

                  <p className="text-gray-400 text-[11px] font-sans line-clamp-2 leading-relaxed">
                    {alert.summary}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-[#121c2a] flex items-center justify-between text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="text-cyan-400">{alert.entityId}</span>
                      <span>•</span>
                      <span className="text-blue-400">{alert.facilityId}</span>
                    </span>
                    <span className="group-hover:text-cyan-300 flex items-center gap-0.5">
                      <span>Investigasi</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom action */}
            <div className="p-2 bg-[#060a10] border-t border-[#142030] text-center">
              <button
                onClick={() => navigate('/terminal/alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono tracking-wider transition-colors"
              >
                LIHAT SEMUA NOTIFIKASI RISIKO →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
