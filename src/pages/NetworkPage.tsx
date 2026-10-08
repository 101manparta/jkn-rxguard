import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CytoscapeGraph } from '../components/network/CytoscapeGraph';
import { NETWORK_NODES, NETWORK_EDGES } from '../data/mockData';
import { NetworkNodeData } from '../types';
import { useTerminal } from '../context/TerminalContext';
import {
  Network,
  Share2,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Activity,
  FileText,
} from 'lucide-react';
import { RiskScoreBadge } from '../components/common/StatusBadge';

export const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get('focus');

  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(() => {
    if (focusParam) {
      const match = NETWORK_NODES.find((n) => n.id.toLowerCase() === focusParam.toLowerCase());
      if (match) return match;
    }
    return NETWORK_NODES[0]; // P00182
  });

  const [activeCluster, setActiveCluster] = useState<'all' | 'P00182' | 'MEDX' | 'FKTP0182'>('all');

  // Compute connected entities for the selected node
  const connectedEdges = selectedNode
    ? NETWORK_EDGES.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  const connectedEntityIds = selectedNode
    ? connectedEdges.map((e) => (e.source === selectedNode.id ? e.target : e.source))
    : [];

  const connectedNodes = NETWORK_NODES.filter((n) => connectedEntityIds.includes(n.id));

  return (
    <div className="p-3 sm:p-4 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#142131] gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h1 className="text-base font-bold text-gray-100 tracking-wider">
            NETWORK INVESTIGATION
          </h1>
          <span className="text-gray-500">| ANALISIS TOPOLOGI RELASI ENTITAS & SINDIKASI</span>
        </div>
        <div className="text-xs text-gray-400">
          NODES: <strong className="text-cyan-400">{NETWORK_NODES.length}</strong> | EDGES: <strong className="text-blue-400">{NETWORK_EDGES.length}</strong>
        </div>
      </div>

      {/* Cluster presets bar */}
      <div className="bg-[#080d14] border border-[#1a283a] p-2.5 rounded-[2px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">PRESET KLASTER KASUS:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveCluster('all');
                setSelectedNode(NETWORK_NODES[0]);
              }}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors ${
                activeCluster === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
              }`}
            >
              Semua Entitas
            </button>
            <button
              onClick={() => {
                setActiveCluster('P00182');
                const node = NETWORK_NODES.find((n) => n.id === 'P00182');
                if (node) setSelectedNode(node);
              }}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors ${
                activeCluster === 'P00182'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
              }`}
            >
              Klaster P00182 (Cross-Facility)
            </button>
            <button
              onClick={() => {
                setActiveCluster('MEDX');
                const node = NETWORK_NODES.find((n) => n.id === 'MEDX');
                if (node) setSelectedNode(node);
              }}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors ${
                activeCluster === 'MEDX'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
              }`}
            >
              Klaster MEDX (Lonjakan Kuota)
            </button>
            <button
              onClick={() => {
                setActiveCluster('FKTP0182');
                const node = NETWORK_NODES.find((n) => n.id === 'FKTP0182');
                if (node) setSelectedNode(node);
              }}
              className={`px-2 py-0.5 rounded-[2px] border text-[11px] transition-colors ${
                activeCluster === 'FKTP0182'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-[#060a10] text-gray-400 border-[#1a2738] hover:text-gray-200'
              }`}
            >
              Klaster FKTP0182 (Faskes Sentra)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 hidden sm:block">
          Klik sembarang node untuk memfokuskan investigasi relasi
        </div>
      </div>

      {/* Main Grid: Cytoscape (8 cols) + Relationship Details (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Cytoscape Canvas */}
        <div className="lg:col-span-8 space-y-2">
          <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-2">
            <CytoscapeGraph
              nodes={NETWORK_NODES}
              edges={NETWORK_EDGES}
              height="530px"
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </div>
        </div>

        {/* Selected Node & Connected Entities Panel */}
        <div className="lg:col-span-4 space-y-3">
          {selectedNode ? (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-3 space-y-3">
              {/* Header */}
              <div className="pb-2 border-b border-[#142232]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    {selectedNode.type} PROFILE
                  </span>
                  <RiskScoreBadge score={selectedNode.riskScore} />
                </div>
                <h3 className="text-lg font-bold text-gray-100 mt-1">{selectedNode.id}</h3>
                <p className="text-gray-400 text-xs font-sans mt-0.5">{selectedNode.subtitle}</p>
              </div>

              {/* Connected Entities List */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-semibold">
                  <span>ENTITAS TERHUBUNG LANGSUNG:</span>
                  <span className="text-cyan-400">{connectedNodes.length} Entitas</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {connectedNodes.length > 0 ? (
                    connectedNodes.map((n) => {
                      const relEdge = connectedEdges.find(
                        (e) =>
                          (e.source === selectedNode.id && e.target === n.id) ||
                          (e.target === selectedNode.id && e.source === n.id)
                      );

                      return (
                        <div
                          key={n.id}
                          onClick={() => setSelectedNode(n)}
                          className="p-2 bg-[#0a121e] hover:bg-[#101e30] border border-[#16263b] rounded-[2px] cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">
                                {n.id}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase">({n.type})</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-sans block">
                              {n.subtitle}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] bg-[#122336] text-cyan-300 px-1.5 py-0.5 rounded-[2px] border border-cyan-800/50 block mb-0.5">
                              {relEdge?.label || 'Terkoneksi'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">Skor: {n.riskScore}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Tidak ada relasi langsung tercatat.
                    </div>
                  )}
                </div>
              </div>

              {/* Relationship Timeline */}
              <div className="pt-2 border-t border-[#142232]">
                <div className="text-[11px] text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>KRONOLOGI INTERAKSI JARINGAN:</span>
                </div>

                <div className="space-y-2 text-[11px] font-sans border-l-2 border-[#1c2e42] pl-3 ml-1.5">
                  <div className="relative">
                    <span className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-gray-500 font-mono text-[10px]">18 OKT 2026 10:18 WITA</span>
                    <p className="text-gray-200">
                      Dispensing di FKTP0182 zat aktif MEDY (Klaster berulang)
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-gray-500 font-mono text-[10px]">12 OKT 2026 16:40 WITA</span>
                    <p className="text-gray-200">
                      Klaim di FKRTL0045 obat MEDY tanpa resume rujukan
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-gray-500 font-mono text-[10px]">07 OKT 2026 11:05 WITA</span>
                    <p className="text-gray-200">
                      Pengambilan di FKTP0301 resep MEDX (+50% volume resep)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Jump Action */}
              <div className="pt-2 border-t border-[#142232] flex justify-end">
                <button
                  onClick={() => navigate('/terminal/investigations?id=INV0281')}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>BUKA INVESTIGASI KASUS LENGKAP</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#080d14] border border-[#1a283a] rounded-[2px] p-6 text-center text-gray-500">
              Pilih sebuah node pada graf untuk melihat detail relasi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
