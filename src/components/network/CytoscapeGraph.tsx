import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { NetworkNodeData, NetworkEdgeData } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Crosshair,
  Play,
  Pause,
  Layers,
  Link as LinkIcon,
  UserRound,
  Building2,
  Pill,
  FileText,
  TriangleAlert,
  Filter,
  Eye,
  EyeOff,
  Move,
  Compass,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface CytoscapeGraphProps {
  nodes: NetworkNodeData[];
  edges: NetworkEdgeData[];
  onSelectNode?: (node: NetworkNodeData | null) => void;
  selectedNodeId?: string | null;
  height?: string;
  filterType?: string;
}

interface Node3DPosition {
  x: number;
  y: number;
  z: number;
}

// Semantic 3D coordinate presets for consistent, meaningful topological clustering
const PRESET_COORDINATES: Record<'spatial' | 'stratified' | 'radial', Record<string, Node3DPosition>> = {
  spatial: {
    // Participant Syndicate Cluster (Upper-Left front)
    P00182: { x: -140, y: 45, z: 50 },
    P00291: { x: -185, y: 15, z: 25 },
    P00412: { x: -115, y: 105, z: -20 },
    P00381: { x: -160, y: -25, z: -40 },

    // Facility Healthcare Network (Upper-Right)
    FKTP0182: { x: 110, y: 70, z: -30 },
    FKTP0291: { x: 150, y: 30, z: 25 },
    FKTP0301: { x: 85, y: 115, z: 10 },
    FKRTL0045: { x: 175, y: 90, z: -60 },
    FKTP0512: { x: 190, y: -20, z: -25 },

    // Medication / Substance Cluster (Lower-Left front)
    MEDX: { x: -70, y: -85, z: 55 },
    MEDY: { x: -125, y: -100, z: 30 },
    'MED-INS01': { x: -35, y: -130, z: -35 },

    // Risk Alert Anomaly Cluster (Lower-Right)
    ALERT0281: { x: 90, y: -75, z: 45 },
    ALERT0279: { x: 130, y: -100, z: -25 },
    ALERT0277: { x: 50, y: -120, z: 15 },

    // Central Transaction Bridge
    RX18291: { x: -15, y: 10, z: 15 },
  },
  stratified: {
    // Multi-planar stratified layers (Domain tiers along Y and Z planes)
    // Tier 1: Participants (Top elevation, Y = 100)
    P00182: { x: -140, y: 95, z: 40 },
    P00291: { x: -70, y: 95, z: 0 },
    P00412: { x: 70, y: 95, z: -30 },
    P00381: { x: 140, y: 95, z: 20 },

    // Tier 2: Facilities (Middle upper elevation, Y = 35)
    FKTP0182: { x: -160, y: 35, z: -40 },
    FKTP0291: { x: -80, y: 35, z: 30 },
    FKTP0301: { x: 0, y: 35, z: -20 },
    FKRTL0045: { x: 80, y: 35, z: 40 },
    FKTP0512: { x: 160, y: 35, z: -30 },

    // Tier 3: Prescription Transactions (Central nexus, Y = -25)
    RX18291: { x: 0, y: -25, z: 10 },

    // Tier 4: Medications (Lower tier, Y = -80)
    MEDX: { x: -120, y: -80, z: 25 },
    MEDY: { x: 0, y: -80, z: -30 },
    'MED-INS01': { x: 120, y: -80, z: 30 },

    // Tier 5: Risk Alerts (Base anomaly tier, Y = -135)
    ALERT0281: { x: -100, y: -135, z: 20 },
    ALERT0279: { x: 0, y: -135, z: -20 },
    ALERT0277: { x: 100, y: -135, z: 20 },
  },
  radial: {
    // Concentric radial field
    RX18291: { x: 0, y: 0, z: 0 },
    P00182: { x: -90, y: 25, z: 40 },
    FKTP0182: { x: 70, y: 40, z: 50 },
    MEDX: { x: -50, y: -70, z: 60 },
    ALERT0281: { x: 80, y: -60, z: 40 },

    P00291: { x: -160, y: 50, z: -30 },
    P00412: { x: -130, y: 110, z: 20 },
    P00381: { x: -190, y: -40, z: 10 },

    FKTP0291: { x: 140, y: 60, z: -40 },
    FKTP0301: { x: 110, y: 120, z: 30 },
    FKRTL0045: { x: 180, y: 100, z: 50 },
    FKTP0512: { x: 190, y: -50, z: -30 },

    MEDY: { x: -110, y: -110, z: -40 },
    'MED-INS01': { x: -40, y: -140, z: -20 },

    ALERT0279: { x: 130, y: -110, z: -30 },
    ALERT0277: { x: 70, y: -130, z: 20 },
  },
};

/**
 * Creates ultra-sharp 512x512 Canvas textures for 3D nodes.
 * Adheres strictly to JKN RXGUARD visual identity:
 * - Participant: Person silhouette in cyan circular containment
 * - Facility: Hospital/clinic building with cross in cobalt blue container
 * - Medication: Medicine capsule pill in amber container
 * - Prescription: Medical document script in purple container
 * - Risk Alert: Warning triangle with exclamation mark in emergency red container
 */
function createNodeTexture(
  node: NetworkNodeData,
  isSelected: boolean,
  isConnected: boolean,
  isDimmed: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);
  const cx = 256;
  const cy = 256;

  // Semantic configuration per entity type
  let primaryColor = '#06b6d4'; // Cyan (Participant)
  let glowColor = 'rgba(6, 182, 212, 0.45)';
  let bgGradStart = '#0b2a3a';
  let bgGradEnd = '#041118';
  let badgeLabel = 'PESERTA JKN';

  if (node.type === 'facility') {
    primaryColor = '#3b82f6'; // Blue
    glowColor = 'rgba(59, 130, 246, 0.45)';
    bgGradStart = '#0e2b4f';
    bgGradEnd = '#051324';
    badgeLabel = 'FASILITAS';
  } else if (node.type === 'medication') {
    primaryColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.45)';
    bgGradStart = '#3c2306';
    bgGradEnd = '#180d02';
    badgeLabel = 'OBAT / FARMA';
  } else if (node.type === 'alert') {
    primaryColor = '#ef4444'; // Red
    glowColor = 'rgba(239, 68, 68, 0.65)';
    bgGradStart = '#480d0d';
    bgGradEnd = '#1e0505';
    badgeLabel = node.riskScore >= 90 ? 'ALERT KRITIS' : 'RISK ALERT';
  } else if (node.type === 'prescription') {
    primaryColor = '#a855f7'; // Purple / Violet
    glowColor = 'rgba(168, 85, 247, 0.45)';
    bgGradStart = '#330e4f';
    bgGradEnd = '#150522';
    badgeLabel = 'TRANSAKSI RESEP';
  }

  // Node radius based on importance and degree
  const degree = node.degree || 3;
  const radius = 130 + Math.min(degree * 4, 30);

  // 1. Volumetric Ambient Glow
  const glowRadius = radius + (isSelected ? 52 : isConnected ? 28 : 14);
  const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.65, cx, cy, glowRadius);
  glowGradient.addColorStop(0, glowColor);
  glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Selected outer high-precision bracket / reticle
  if (isSelected) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Corner brackets for tactical intelligence feel
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    const bDist = radius + 22;
    const bLen = 18;

    // Top-Left bracket
    ctx.beginPath();
    ctx.moveTo(cx - bDist, cy - bDist + bLen);
    ctx.lineTo(cx - bDist, cy - bDist);
    ctx.lineTo(cx - bDist + bLen, cy - bDist);
    ctx.stroke();

    // Top-Right bracket
    ctx.beginPath();
    ctx.moveTo(cx + bDist - bLen, cy - bDist);
    ctx.lineTo(cx + bDist, cy - bDist);
    ctx.lineTo(cx + bDist, cy - bDist + bLen);
    ctx.stroke();

    // Bottom-Left bracket
    ctx.beginPath();
    ctx.moveTo(cx - bDist, cy + bDist - bLen);
    ctx.lineTo(cx - bDist, cy + bDist);
    ctx.lineTo(cx - bDist + bLen, cy + bDist);
    ctx.stroke();

    // Bottom-Right bracket
    ctx.beginPath();
    ctx.moveTo(cx + bDist - bLen, cy + bDist);
    ctx.lineTo(cx + bDist, cy + bDist);
    ctx.lineTo(cx + bDist, cy + bDist - bLen);
    ctx.stroke();
  }

  // 3. Node Main Body (Volumetric dark shaded circle/shape)
  const bodyGradient = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.35,
    radius * 0.1,
    cx,
    cy,
    radius
  );
  bodyGradient.addColorStop(0, bgGradStart);
  bodyGradient.addColorStop(0.75, bgGradEnd);
  bodyGradient.addColorStop(1, '#020509');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Primary Contour Rings
  ctx.strokeStyle = isSelected ? '#ffffff' : primaryColor;
  ctx.lineWidth = isSelected ? 6 : 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle inner accent track
  ctx.strokeStyle = `${primaryColor}40`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // 5. Semantic Icon Drawing (Crisp custom vector rendering)
  ctx.save();
  ctx.translate(cx, cy - 26);
  ctx.fillStyle = primaryColor;
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (node.type === 'participant') {
    // === PARTICIPANT: Person / UserRound silhouette ===
    // Head circle with highlight
    ctx.beginPath();
    ctx.arc(0, -28, 22, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.fill();

    // Torso / Shoulders arc with ergonomic silhouette
    ctx.beginPath();
    ctx.arc(0, 32, 42, Math.PI * 1.15, Math.PI * 1.85);
    ctx.lineWidth = 6;
    ctx.stroke();

    // Subtly filled chest silhouette
    ctx.beginPath();
    ctx.arc(0, 32, 42, Math.PI * 1.18, Math.PI * 1.82);
    ctx.lineTo(0, 26);
    ctx.closePath();
    ctx.fillStyle = `${primaryColor}33`;
    ctx.fill();
  } else if (node.type === 'facility') {
    // === FACILITY: Healthcare Facility / Hospital facade with Cross ===
    // Building main outer contour
    ctx.strokeRect(-36, -34, 72, 68);

    // Architectural pediment / roof overhang
    ctx.beginPath();
    ctx.moveTo(-42, -34);
    ctx.lineTo(42, -34);
    ctx.stroke();

    // Clinic Medical Cross emblem in center
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-6, -22, 12, 30);
    ctx.fillRect(-15, -13, 30, 12);

    // Clinic Entrance Doorway
    ctx.strokeRect(-10, 14, 20, 20);

    // Accent Windows
    ctx.fillRect(-28, -6, 8, 8);
    ctx.fillRect(20, -6, 8, 8);
  } else if (node.type === 'medication') {
    // === MEDICATION: Recognizable Medicine Capsule Pill ===
    ctx.save();
    ctx.rotate(-Math.PI / 4);

    // Capsule Body Contour
    ctx.beginPath();
    ctx.roundRect(-20, -42, 40, 84, 20);
    ctx.lineWidth = 5;
    ctx.stroke();

    // Division seam band
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.lineWidth = 4;
    ctx.stroke();

    // Fill upper hemisphere (Active ingredient)
    ctx.beginPath();
    ctx.roundRect(-20, -42, 40, 42, [20, 20, 0, 0]);
    ctx.fillStyle = primaryColor;
    ctx.fill();

    // Lower half subtle tint
    ctx.beginPath();
    ctx.roundRect(-20, 0, 40, 42, [0, 0, 20, 20]);
    ctx.fillStyle = `${primaryColor}26`;
    ctx.fill();

    // Subtle gloss streak on pill shell
    ctx.beginPath();
    ctx.moveTo(-10, -32);
    ctx.lineTo(-10, -10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  } else if (node.type === 'prescription') {
    // === PRESCRIPTION: Medical prescription document with 'Rx' ===
    // Document sheet with folded dog-ear top-right corner
    ctx.beginPath();
    ctx.moveTo(-28, -40);
    ctx.lineTo(12, -40);
    ctx.lineTo(28, -24);
    ctx.lineTo(28, 38);
    ctx.lineTo(-28, 38);
    ctx.closePath();
    ctx.stroke();

    // Folded corner crease
    ctx.beginPath();
    ctx.moveTo(12, -40);
    ctx.lineTo(12, -24);
    ctx.lineTo(28, -24);
    ctx.stroke();

    // Bold "Rx" Emblem
    ctx.font = 'bold 24px "IBM Plex Sans", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = primaryColor;
    ctx.fillText('Rx', -4, -6);

    // Clinical document lines
    ctx.beginPath();
    ctx.moveTo(-18, 14);
    ctx.lineTo(18, 14);
    ctx.moveTo(-18, 24);
    ctx.lineTo(14, 24);
    ctx.lineWidth = 3.5;
    ctx.stroke();
  } else if (node.type === 'alert') {
    // === RISK ALERT: Warning Triangle with Exclamation Symbol ===
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(44, 30);
    ctx.lineTo(-44, 30);
    ctx.closePath();
    ctx.fillStyle = primaryColor;
    ctx.fill();

    // Inner dark contrast triangle
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(32, 22);
    ctx.lineTo(-32, 22);
    ctx.closePath();
    ctx.fillStyle = '#180404';
    ctx.fill();

    // Exclamation mark in bright red/white
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-4, -16, 8, 22, 3);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // 6. Typography: Entity ID (Prominent monospace label)
  ctx.font = 'bold 36px "IBM Plex Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(node.label, cx, cy + 36);

  // 7. Subtitle / Entity classification tag
  ctx.font = '600 17px "IBM Plex Sans", sans-serif';
  ctx.fillStyle = `${primaryColor}dd`;
  ctx.fillText(badgeLabel, cx, cy + 72);

  // 8. Top Risk Score Badge (If elevated)
  if (node.riskScore >= 50) {
    const isCritical = node.riskScore >= 85;
    const scoreBg = isCritical ? '#ef4444' : '#f59e0b';

    ctx.fillStyle = scoreBg;
    ctx.beginPath();
    ctx.roundRect(cx - 36, cy - radius - 24, 72, 28, 5);
    ctx.fill();

    ctx.font = 'bold 16px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#060a0f';
    ctx.fillText(`${node.riskScore}`, cx, cy - radius - 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  height = '500px',
  filterType = 'all',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // View Layout Modes & Interaction state
  const [viewMode, setViewMode] = useState<'spatial' | 'stratified' | 'radial'>('spatial');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isIsolateMode, setIsIsolateMode] = useState<boolean>(false);
  const [interactionMode, setInteractionMode] = useState<'orbit' | 'pan'>('orbit');

  // Hover & Active Selection state
  const [activeSelection, setActiveSelection] = useState<string | null>(selectedNodeId || 'P00182');
  const [hoveredNode, setHoveredNode] = useState<{
    data: NetworkNodeData;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Camera telemetry state for HUD display
  const [telemetry, setTelemetry] = useState({
    zoomPercent: 100,
    elevationDeg: 12,
    azimuthDeg: 0,
  });

  // Camera smooth dampening target controls
  const cameraState = useRef({
    currentPos: new THREE.Vector3(0, 50, 490),
    targetPos: new THREE.Vector3(0, 50, 490),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    orbitAngle: { theta: 0, phi: 0.12 },
    orbitRadius: 490,
  });

  // Track 3D Meshes
  const nodeSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const nodeDropLinesRef = useRef<Array<THREE.Line>>(new Array());
  const nodeFloorRingsRef = useRef<Array<THREE.Mesh>>(new Array());
  const edgeCurvesRef = useRef<
    Array<{
      id: string;
      source: string;
      target: string;
      line: THREE.Line;
      curve: THREE.QuadraticBezierCurve3;
      color: number;
    }>
  >([]);
  const flowParticlesMeshRef = useRef<THREE.Points | null>(null);
  const selectionReticleRef = useRef<THREE.Mesh | null>(null);

  // Sync external selectedNodeId
  useEffect(() => {
    if (selectedNodeId !== undefined) {
      setActiveSelection(selectedNodeId);
    }
  }, [selectedNodeId]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (filterType === 'all') return true;
      return n.type === filterType;
    });
  }, [nodes, filterType]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, NetworkNodeData>();
    filteredNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [filteredNodes]);

  // Active Edges
  const activeEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [edges, filteredNodes]);

  // Connected nodes to activeSelection
  const connectedNodeIds = useMemo(() => {
    if (!activeSelection) return new Set<string>();
    const set = new Set<string>();
    set.add(activeSelection);
    activeEdges.forEach((e) => {
      if (e.source === activeSelection) set.add(e.target);
      if (e.target === activeSelection) set.add(e.source);
    });
    return set;
  }, [activeSelection, activeEdges]);

  // Connected nodes list for active selection HUD
  const connectedNeighborsList = useMemo(() => {
    if (!activeSelection) return [];
    const list: NetworkNodeData[] = [];
    connectedNodeIds.forEach((id) => {
      if (id !== activeSelection) {
        const item = nodeMap.get(id);
        if (item) list.push(item);
      }
    });
    return list;
  }, [activeSelection, connectedNodeIds, nodeMap]);

  // Nodes to display (Accounts for Isolate Mode)
  const displayNodes = useMemo(() => {
    if (!isIsolateMode || !activeSelection) return filteredNodes;
    return filteredNodes.filter((n) => connectedNodeIds.has(n.id));
  }, [filteredNodes, isIsolateMode, activeSelection, connectedNodeIds]);

  // ----------------------------------------------------
  // INITIALIZE THREE.JS SCENE
  // ----------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05080e);
    scene.fog = new THREE.FogExp2(0x05080e, 0.0009);
    sceneRef.current = scene;

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 1, 3500);
    camera.position.set(0, 50, 490);
    cameraRef.current = camera;

    // 3. High-Performance Antialiased Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Tactical Radar Ground Plane
    const groundGrid = new THREE.GridHelper(800, 32, 0x14283c, 0x091420);
    groundGrid.position.y = -140;
    scene.add(groundGrid);

    // Subtle distance radar concentric rings on ground
    [120, 240, 360].forEach((r) => {
      const ringGeom = new THREE.RingGeometry(r - 0.75, r + 0.75, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0c2032,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -139.8;
      scene.add(ringMesh);
    });

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x243b55, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xaed8f2, 1.6);
    dirLight.position.set(200, 350, 250);
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 2.5, 900);
    cyanPointLight.position.set(-120, 120, 180);
    scene.add(cyanPointLight);

    const amberPointLight = new THREE.PointLight(0xf59e0b, 1.6, 700);
    amberPointLight.position.set(120, -100, 140);
    scene.add(amberPointLight);

    // 6. Selection Reticle Mesh in 3D
    const reticleGeom = new THREE.RingGeometry(22, 25, 48);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const reticleMesh = new THREE.Mesh(reticleGeom, reticleMat);
    reticleMesh.rotation.x = Math.PI / 2;
    reticleMesh.visible = false;
    scene.add(reticleMesh);
    selectionReticleRef.current = reticleMesh;

    // 7. Dynamic Flow Particles Mesh
    const PARTICLE_COUNT = 180;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle sprite texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(0.3, '#06b6d4');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      map: pTexture,
      size: 14,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x67e8f9,
    });
    const flowPoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(flowPoints);
    flowParticlesMeshRef.current = flowPoints;

    // Particle flow progression state
    const particleTValues = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleTValues[i] = Math.random();
    }

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const state = cameraState.current;

      // Auto-Orbit if toggled
      if (isAutoRotating && !state.isDragging) {
        state.orbitAngle.theta += 0.22 * delta;
        const r = state.orbitRadius;
        state.targetPos.x =
          state.targetLookAt.x + r * Math.sin(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
        state.targetPos.z =
          state.targetLookAt.z + r * Math.cos(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
        state.targetPos.y = state.targetLookAt.y + r * Math.sin(state.orbitAngle.phi);
      }

      // Smooth Camera Lerp
      state.currentPos.lerp(state.targetPos, 0.085);
      state.currentLookAt.lerp(state.targetLookAt, 0.085);
      camera.position.copy(state.currentPos);
      camera.lookAt(state.currentLookAt);

      // Telemetry updates
      const zoomPct = Math.round((490 / state.orbitRadius) * 100);
      const elev = Math.round((state.orbitAngle.phi * 180) / Math.PI);
      const azim = Math.round((state.orbitAngle.theta * 180) / Math.PI) % 360;
      setTelemetry({
        zoomPercent: zoomPct,
        elevationDeg: elev,
        azimuthDeg: azim < 0 ? azim + 360 : azim,
      });

      // Flowing Pulse Particles along Active Edge Curves
      const activeCurves = edgeCurvesRef.current;
      if (activeCurves.length > 0 && flowParticlesMeshRef.current) {
        const positionsAttr = flowParticlesMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = positionsAttr.array as Float32Array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particleTValues[i] = (particleTValues[i] + 0.35 * delta) % 1;
          const curveIdx = i % activeCurves.length;
          const curve = activeCurves[curveIdx].curve;
          const point = curve.getPoint(particleTValues[i]);

          posArray[i * 3] = point.x;
          posArray[i * 3 + 1] = point.y;
          posArray[i * 3 + 2] = point.z;
        }
        positionsAttr.needsUpdate = true;
      }

      // Pulsing Selection Reticle
      if (selectionReticleRef.current && selectionReticleRef.current.visible) {
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.12;
        selectionReticleRef.current.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container) container.innerHTML = '';
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  // ----------------------------------------------------
  // UPDATE 3D NODES & EDGES ON STATE CHANGES
  // ----------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous node sprites & lines
    nodeSpritesRef.current.forEach((sprite) => scene.remove(sprite));
    nodeSpritesRef.current.clear();

    nodeDropLinesRef.current.forEach((line) => scene.remove(line));
    nodeDropLinesRef.current = [];

    nodeFloorRingsRef.current.forEach((ring) => scene.remove(ring));
    nodeFloorRingsRef.current = [];

    edgeCurvesRef.current.forEach((item) => scene.remove(item.line));
    edgeCurvesRef.current = [];

    const positions = PRESET_COORDINATES[viewMode] || PRESET_COORDINATES.spatial;

    // 1. Build Node Meshes & Spatial Drop Stems
    displayNodes.forEach((node) => {
      const isSelected = activeSelection === node.id;
      const isConnected = connectedNodeIds.has(node.id);
      const isDimmed = activeSelection !== null && !isConnected;

      // Position in 3D Space
      const pos = positions[node.id] || {
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 160,
        z: (Math.random() - 0.5) * 100,
      };

      // Create Crisp High-Res Billboard Sprite
      const texture = createNodeTexture(node, isSelected, isConnected, isDimmed);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: isDimmed ? (isIsolateMode ? 0.05 : 0.25) : 1.0,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);

      // Dynamic Node Scale based on Degree & Role
      const baseDegree = node.degree || 3;
      let scale = 48 + baseDegree * 4;
      if (isSelected) scale *= 1.25;
      else if (isConnected) scale *= 1.1;

      sprite.scale.set(scale, scale, 1);
      sprite.position.set(pos.x, pos.y, pos.z);
      sprite.userData = { id: node.id, nodeData: node };

      scene.add(sprite);
      nodeSpritesRef.current.set(node.id, sprite);

      // Vertical Altitude Stem dropping to Ground Plane (-140)
      const stemPoints = [new THREE.Vector3(pos.x, pos.y, pos.z), new THREE.Vector3(pos.x, -140, pos.z)];
      const stemGeom = new THREE.BufferGeometry().setFromPoints(stemPoints);
      const stemMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x06b6d4 : 0x172a3e,
        transparent: true,
        opacity: isDimmed ? 0.08 : isSelected ? 0.75 : 0.35,
      });
      const stemLine = new THREE.Line(stemGeom, stemMat);
      scene.add(stemLine);
      nodeDropLinesRef.current.push(stemLine);

      // Ground Anchor Ring at bottom of stem
      const groundRingGeom = new THREE.RingGeometry(isSelected ? 6 : 4, isSelected ? 8 : 5.5, 32);
      const groundRingMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x06b6d4 : 0x1b354e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDimmed ? 0.1 : 0.6,
      });
      const groundRingMesh = new THREE.Mesh(groundRingGeom, groundRingMat);
      groundRingMesh.rotation.x = Math.PI / 2;
      groundRingMesh.position.set(pos.x, -139.5, pos.z);
      scene.add(groundRingMesh);
      nodeFloorRingsRef.current.push(groundRingMesh);

      // If Selected: align 3D selection reticle
      if (isSelected && selectionReticleRef.current) {
        selectionReticleRef.current.position.set(pos.x, pos.y, pos.z);
        selectionReticleRef.current.visible = true;
      }
    });

    // 2. Build 3D Smooth Bezier Edges
    activeEdges.forEach((edge) => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      if (!srcNode || !tgtNode) return;

      // In isolate mode, only draw edges connected to activeSelection
      if (isIsolateMode && activeSelection && edge.source !== activeSelection && edge.target !== activeSelection) {
        return;
      }

      const srcPos = positions[edge.source] || { x: 0, y: 0, z: 0 };
      const tgtPos = positions[edge.target] || { x: 0, y: 0, z: 0 };

      const v1 = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z);
      const v2 = new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z);

      // Calculate graceful 3D arch curve control point
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.y += dist * 0.14; // smooth arch elevation
      mid.z += Math.sin(dist * 0.05) * 16;

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(28);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const isConnectedToActive =
        activeSelection !== null && (edge.source === activeSelection || edge.target === activeSelection);
      const isDimmed = activeSelection !== null && !isConnectedToActive;

      // Edge styling & Color coding based on relationship
      let lineColor = 0x22364c; // subtle default
      let opacity = isDimmed ? 0.08 : 0.45;
      let lineWidth = 1;

      if (isConnectedToActive) {
        if (srcNode.type === 'alert' || tgtNode.type === 'alert') {
          lineColor = 0xef4444; // Warning alert red
        } else if (srcNode.type === 'medication' || tgtNode.type === 'medication') {
          lineColor = 0xf59e0b; // Medication dispensation amber
        } else if (srcNode.type === 'prescription' || tgtNode.type === 'prescription') {
          lineColor = 0xa855f7; // Prescription violet
        } else {
          lineColor = 0x06b6d4; // Cyan correlation
        }
        opacity = 0.95;
        lineWidth = 2.5;
      }

      const material = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity,
        linewidth: lineWidth,
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);

      edgeCurvesRef.current.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        line,
        curve,
        color: lineColor,
      });
    });

    if (!activeSelection && selectionReticleRef.current) {
      selectionReticleRef.current.visible = false;
    }
  }, [displayNodes, activeEdges, activeSelection, connectedNodeIds, viewMode, isIsolateMode, nodeMap]);

  // ----------------------------------------------------
  // CAMERA SMOOTH GLIDE TO TARGET NODE
  // ----------------------------------------------------
  const focusOnNode = useCallback(
    (nodeId: string) => {
      const positions = PRESET_COORDINATES[viewMode] || PRESET_COORDINATES.spatial;
      const pos = positions[nodeId];
      if (!pos || !cameraState.current) return;

      cameraState.current.targetLookAt.set(pos.x, pos.y, pos.z);
      // Position camera at smooth tactical distance from node
      cameraState.current.targetPos.set(pos.x + 40, pos.y + 30, pos.z + 240);
      cameraState.current.orbitRadius = 240;
    },
    [viewMode]
  );

  // Focus on node whenever activeSelection changes
  useEffect(() => {
    if (activeSelection) {
      focusOnNode(activeSelection);
    }
  }, [activeSelection, focusOnNode]);

  // ----------------------------------------------------
  // POINTER & ORBIT / PAN INTERACTIONS
  // ----------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = cameraState.current;
    state.isDragging = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const state = cameraState.current;

    // 1. Raycast detection for hover tooltip
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const sprites = Array.from(nodeSpritesRef.current.values());
    const intersects = raycaster.intersectObjects(sprites, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Sprite;
      const nodeData = hit.userData.nodeData as NetworkNodeData;
      setHoveredNode({
        data: nodeData,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
      });
      container.style.cursor = 'pointer';
    } else {
      setHoveredNode(null);
      container.style.cursor = state.isDragging ? 'grabbing' : 'default';
    }

    // 2. Drag Motion (Orbit or Pan)
    if (!state.isDragging) return;

    const dx = e.clientX - state.dragStart.x;
    const dy = e.clientY - state.dragStart.y;
    state.dragStart = { x: e.clientX, y: e.clientY };

    const isPanning = interactionMode === 'pan' || e.button === 2 || e.shiftKey;

    if (isPanning) {
      // Pan camera target along camera basis
      const factor = state.orbitRadius * 0.0016;
      state.targetLookAt.x -= dx * factor;
      state.targetLookAt.y += dy * factor;
      state.targetPos.x -= dx * factor;
      state.targetPos.y += dy * factor;
    } else {
      // 3D Spherical Orbit
      state.orbitAngle.theta -= dx * 0.007;
      state.orbitAngle.phi = Math.max(
        -Math.PI / 2.3,
        Math.min(Math.PI / 2.3, state.orbitAngle.phi + dy * 0.007)
      );

      const r = state.orbitRadius;
      state.targetPos.x =
        state.targetLookAt.x + r * Math.sin(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
      state.targetPos.z =
        state.targetLookAt.z + r * Math.cos(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
      state.targetPos.y = state.targetLookAt.y + r * Math.sin(state.orbitAngle.phi);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const state = cameraState.current;
    state.isDragging = false;

    if (!container || !camera) return;

    // Check if clicked directly on a node
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const sprites = Array.from(nodeSpritesRef.current.values());
    const intersects = raycaster.intersectObjects(sprites, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Sprite;
      const nodeData = hit.userData.nodeData as NetworkNodeData;
      setActiveSelection(nodeData.id);
      if (onSelectNode) onSelectNode(nodeData);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const state = cameraState.current;
    const zoomFactor = e.deltaY > 0 ? 1.12 : 0.88;
    state.orbitRadius = Math.max(130, Math.min(920, state.orbitRadius * zoomFactor));

    const r = state.orbitRadius;
    state.targetPos.x =
      state.targetLookAt.x + r * Math.sin(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
    state.targetPos.z =
      state.targetLookAt.z + r * Math.cos(state.orbitAngle.theta) * Math.cos(state.orbitAngle.phi);
    state.targetPos.y = state.targetLookAt.y + r * Math.sin(state.orbitAngle.phi);
  };

  // ----------------------------------------------------
  // TOOLBAR CAMERA ACTIONS
  // ----------------------------------------------------
  const handleZoomIn = () => {
    const state = cameraState.current;
    state.orbitRadius = Math.max(130, state.orbitRadius * 0.82);
    state.targetPos.multiplyScalar(0.85);
  };

  const handleZoomOut = () => {
    const state = cameraState.current;
    state.orbitRadius = Math.min(920, state.orbitRadius * 1.22);
    state.targetPos.multiplyScalar(1.15);
  };

  const handleFit = () => {
    const state = cameraState.current;
    state.targetLookAt.set(0, 0, 0);
    state.orbitAngle = { theta: 0, phi: 0.12 };
    state.orbitRadius = 490;
    state.targetPos.set(0, 50, 490);
  };

  const handleReset = () => {
    handleFit();
    setActiveSelection(null);
    setIsIsolateMode(false);
    if (onSelectNode) onSelectNode(null);
  };

  const handleFocusSelection = () => {
    if (activeSelection) {
      focusOnNode(activeSelection);
    } else {
      handleFit();
    }
  };

  const activeNodeData = useMemo(() => {
    if (!activeSelection) return null;
    return nodeMap.get(activeSelection) || null;
  }, [activeSelection, nodeMap]);

  return (
    <div
      className="relative border border-[#1b2636] bg-[#05080e] rounded-[3px] overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. TOP TELEMETRY & STATUS BAR */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap items-center gap-2 bg-[#080d14]/90 backdrop-blur-xs border border-[#18283c] px-3 py-1.5 rounded-[2px] text-[11px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          3D RISK NETWORK
        </span>
        <span className="text-[#2b3c52]">|</span>
        <span className="text-gray-300 font-medium">
          <strong className="text-cyan-300">{displayNodes.length}</strong> NODES
        </span>
        <span className="text-[#2b3c52]">|</span>
        <span className="text-gray-300 font-medium">
          <strong className="text-blue-300">{activeEdges.length}</strong> RELASI
        </span>
        <span className="text-[#2b3c52] hidden sm:inline">|</span>
        <span className="text-gray-400 text-[10px] hidden sm:inline">
          ZOOM: {telemetry.zoomPercent}%
        </span>
      </div>

      {/* 2. TOP-RIGHT PROFESSIONAL TOOLBAR */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-[#080d14]/90 backdrop-blur-xs border border-[#18283c] p-1 rounded-[2px] shadow-lg">
        {/* Layout Mode Selector */}
        <div className="flex items-center gap-1 pr-1 border-r border-[#1e2e42]">
          {[
            { id: 'spatial', label: '3D SPATIAL' },
            { id: 'stratified', label: 'STRATIFIKASI' },
            { id: 'radial', label: 'RADIAL' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-[1px] transition-colors ${
                viewMode === mode.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#0f1926]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Isolate Cluster Toggle */}
        <button
          onClick={() => setIsIsolateMode(!isIsolateMode)}
          disabled={!activeSelection}
          title={isIsolateMode ? 'Tampilkan Semua Jaringan' : 'Isolasi Klaster Entitas Terpilih'}
          className={`px-2 py-1 text-[10px] font-mono rounded-[2px] flex items-center gap-1 transition-colors ${
            isIsolateMode
              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/80 font-bold'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#0f1926] disabled:opacity-30'
          }`}
        >
          {isIsolateMode ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
          <span className="hidden md:inline">ISOLASI</span>
        </button>

        {/* Orbit vs Pan Interaction Toggle */}
        <button
          onClick={() => setInteractionMode(interactionMode === 'orbit' ? 'pan' : 'orbit')}
          title={interactionMode === 'orbit' ? 'Mode: Rotasi 3D (Klik untuk Ubah ke Geser)' : 'Mode: Geser (Pan)'}
          className={`p-1.5 rounded-[2px] transition-colors ${
            interactionMode === 'pan'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
              : 'hover:bg-[#121f30] text-gray-300 hover:text-cyan-400'
          }`}
        >
          {interactionMode === 'orbit' ? <Compass className="w-3.5 h-3.5" /> : <Move className="w-3.5 h-3.5" />}
        </button>

        {/* Focus on Selected Entity */}
        <button
          onClick={handleFocusSelection}
          title="Fokus Kamera ke Entitas Terpilih"
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-cyan-400 rounded-[2px] transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Controls */}
        <button
          onClick={handleZoomIn}
          title="Perbesar Kamera (+)"
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-cyan-400 rounded-[2px] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Perkecil Kamera (-)"
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-cyan-400 rounded-[2px] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Fit Network */}
        <button
          onClick={handleFit}
          title="Muat Seluruh Graf (Fit)"
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-cyan-400 rounded-[2px] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera */}
        <button
          onClick={handleReset}
          title="Reset Sudut Pandang & Pilihan"
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-cyan-400 rounded-[2px] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Auto Orbit Rotation */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? 'Jeda Rotasi Otomatis' : 'Mulai Rotasi 3D Otomatis Halus'}
          className="p-1.5 hover:bg-[#121f30] text-gray-300 hover:text-amber-400 rounded-[2px] transition-colors"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. SELECTED ENTITY TACTICAL HUD (FLOATING IN NETWORK VIEW) */}
      {activeNodeData && (
        <div className="absolute top-12 left-2.5 z-20 max-w-sm bg-[#080e18]/95 backdrop-blur-xs border border-cyan-800/70 p-2.5 rounded-[2px] text-xs font-mono shadow-2xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#17273a] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-gray-400 text-[10px] uppercase font-semibold">FOKUS INVESTIGASI</span>
              <span className="text-cyan-300 font-bold">{activeNodeData.id}</span>
            </div>
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded-[2px] ${
                activeNodeData.riskScore >= 80
                  ? 'bg-red-950 text-red-400 border border-red-700/80'
                  : 'bg-amber-950 text-amber-400 border border-amber-700/80'
              }`}
            >
              RISK {activeNodeData.riskScore}
            </span>
          </div>

          <div className="pt-1.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="capitalize">{activeNodeData.type}</span>
              <span className="text-gray-300">{connectedNeighborsList.length} Relasi Langsung</span>
            </div>

            {/* Clickable connected neighbors pills */}
            {connectedNeighborsList.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">
                  KONEKSI TERKAIT (KLIK UNTUK TERBANG):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {connectedNeighborsList.map((neighbor) => (
                    <button
                      key={neighbor.id}
                      onClick={() => {
                        setActiveSelection(neighbor.id);
                        if (onSelectNode) onSelectNode(neighbor);
                      }}
                      className="px-1.5 py-0.5 bg-[#0e1b29] hover:bg-cyan-950 text-gray-300 hover:text-cyan-300 border border-[#1b2b3f] hover:border-cyan-700 rounded-[2px] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {neighbor.type === 'facility' && <Building2 className="w-2.5 h-2.5 text-blue-400" />}
                      {neighbor.type === 'medication' && <Pill className="w-2.5 h-2.5 text-amber-400" />}
                      {neighbor.type === 'alert' && <TriangleAlert className="w-2.5 h-2.5 text-red-400" />}
                      {neighbor.type === 'participant' && <UserRound className="w-2.5 h-2.5 text-cyan-400" />}
                      {neighbor.type === 'prescription' && <FileText className="w-2.5 h-2.5 text-purple-400" />}
                      <span>{neighbor.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WEBGL CANVAS CONTAINER */}
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full relative touch-none bg-[#05080e]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* 5. HOVER TOOLTIP OVERLAY */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hoveredNode.screenX + 16, (mountRef.current?.clientWidth || 600) - 240),
            top: Math.max(hoveredNode.screenY - 80, 15),
            pointerEvents: 'none',
          }}
          className="z-30 bg-[#070d16]/95 border border-[#22364e] p-2.5 rounded-[2px] shadow-2xl text-xs font-mono text-gray-200 min-w-52 backdrop-blur-xs animate-in fade-in duration-100"
        >
          <div className="flex items-center justify-between border-b border-[#18283c] pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              {hoveredNode.data.type === 'participant' && <UserRound className="w-3.5 h-3.5 text-cyan-400" />}
              {hoveredNode.data.type === 'facility' && <Building2 className="w-3.5 h-3.5 text-blue-400" />}
              {hoveredNode.data.type === 'medication' && <Pill className="w-3.5 h-3.5 text-amber-400" />}
              {hoveredNode.data.type === 'alert' && <TriangleAlert className="w-3.5 h-3.5 text-red-400" />}
              {hoveredNode.data.type === 'prescription' && <FileText className="w-3.5 h-3.5 text-purple-400" />}
              <span className="font-bold text-gray-100">{hoveredNode.data.id}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              {hoveredNode.data.type}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Score:</span>
              <span className={`font-bold ${hoveredNode.data.riskScore >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                {hoveredNode.data.riskScore} / 100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tingkat Derajat (Koneksi):</span>
              <span className="text-cyan-300 font-semibold">{hoveredNode.data.degree || 3} Entitas</span>
            </div>
            {hoveredNode.data.subtitle && (
              <div className="text-[10px] text-gray-300 font-sans pt-1 border-t border-[#142232] italic">
                {hoveredNode.data.subtitle}
              </div>
            )}
            <div className="text-[9px] text-cyan-400 pt-1 text-right">
              Klik untuk memilih & memfokuskan kamera
            </div>
          </div>
        </div>
      )}

      {/* 6. SEMANTIC BOTTOM LEGEND & INTERACTION GUIDE */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex flex-wrap items-center gap-3 bg-[#080d14]/90 backdrop-blur-xs border border-[#18283c] px-3 py-1.5 rounded-[2px] text-[10px] font-mono text-gray-300">
        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <UserRound className="w-3.5 h-3.5" />
          <span>Peserta JKN</span>
        </span>
        <span className="flex items-center gap-1.5 text-blue-400 font-medium">
          <Building2 className="w-3.5 h-3.5" />
          <span>Fasilitas (FKTP/FKRTL)</span>
        </span>
        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
          <Pill className="w-3.5 h-3.5" />
          <span>Obat & Terapi</span>
        </span>
        <span className="flex items-center gap-1.5 text-purple-400 font-medium">
          <FileText className="w-3.5 h-3.5" />
          <span>Resep / Transaksi</span>
        </span>
        <span className="flex items-center gap-1.5 text-red-400 font-medium">
          <TriangleAlert className="w-3.5 h-3.5" />
          <span>Risk Alert</span>
        </span>
        <span className="text-[#32455d] hidden lg:inline">|</span>
        <span className="text-gray-400 hidden lg:inline">
          Drag: Rotasi 3D • Shift/Kanan: Geser (Pan) • Scroll: Zoom • Klik node: Fokus & Investigasi
        </span>
      </div>
    </div>
  );
};
