import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Participant,
  Medication,
  Facility,
  RiskAlert,
  Investigation,
  TransactionFeedItem,
  AuditLog,
  RiskRule,
  SystemUser,
  AlertStatus,
  UserRole,
} from '../types';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_MEDICATIONS,
  INITIAL_FACILITIES,
  INITIAL_ALERTS,
  INITIAL_INVESTIGATIONS,
  INITIAL_TRANSACTION_FEED,
  INITIAL_AUDIT_LOGS,
  INITIAL_RISK_RULES,
  INITIAL_USERS,
} from '../data/mockData';

export interface CommandVisualResult {
  command: string;
  type: 'participant' | 'medication' | 'facility' | 'alert' | 'investigation' | 'filter' | 'help' | 'system' | 'not_found';
  title: string;
  statusText?: string;
  riskScore?: number;
  riskLevel?: string;
  signals?: string[];
  entityId?: string;
  targetRoute?: string;
  rawText?: string;
}

interface TerminalContextType {
  currentUser: {
    username: string;
    role: UserRole;
    name: string;
  } | null;
  login: (username: string) => boolean;
  logout: () => void;
  participants: Participant[];
  medications: Medication[];
  facilities: Facility[];
  alerts: RiskAlert[];
  investigations: Record<string, Investigation>;
  transactionFeed: TransactionFeedItem[];
  auditLogs: AuditLog[];
  riskRules: RiskRule[];
  systemUsers: SystemUser[];
  updateInvestigationStatus: (id: string, status: AlertStatus, resolutionSummary?: string) => void;
  addInvestigationNote: (id: string, content: string) => void;
  updateRiskRule: (id: string, updates: Partial<RiskRule>) => void;
  toggleUserStatus: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  commandHistory: string[];
  lastCommandResult: CommandVisualResult | null;
  executeCommand: (cmd: string) => CommandVisualResult;
  clearCommandResult: () => void;
  addAuditLog: (action: string, resource: string, details: string, result?: 'SUCCESS' | 'DENIED' | 'FAILED') => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: UserRole; name: string } | null>(() => {
    const saved = localStorage.getItem('rxguard_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default logged in as analyst for immediate prototype exploration
    return {
      username: 'analyst.demo',
      role: 'ANALYST',
      name: 'Analis Investigasi Utama 001',
    };
  });

  const [participants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [medications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [facilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_ALERTS);
  const [investigations, setInvestigations] = useState<Record<string, Investigation>>(INITIAL_INVESTIGATIONS);
  const [transactionFeed, setTransactionFeed] = useState<TransactionFeedItem[]>(INITIAL_TRANSACTION_FEED);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [riskRules, setRiskRules] = useState<RiskRule[]>(INITIAL_RISK_RULES);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_USERS);

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'help',
    'search peserta P00182',
    'risk high',
  ]);
  const [lastCommandResult, setLastCommandResult] = useState<CommandVisualResult | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rxguard_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rxguard_user');
    }
  }, [currentUser]);

  // Global Ctrl+K and Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Simulated live transaction tick every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const sampleParticipants = ['P00182', 'P00412', 'P00291', 'P00381', 'P00711'];
      const sampleFacilities = ['FKTP0182', 'FKTP0291', 'FKTP0301', 'FKRTL0045'];
      const sampleMeds = ['MEDX', 'MEDY', 'MED-CARD02', 'MED-INS01'];
      const signals = [
        { sig: 'CYCLE REFILL VERIFIED', sev: 'LOW' as const, amt: 120000 },
        { sig: 'EARLY REFILL ANOMALY', sev: 'HIGH' as const, amt: 280000 },
        { sig: 'CROSS FACILITY PATTERN', sev: 'MEDIUM' as const, amt: 310000 },
        { sig: 'CLUSTER SYNDICATE FLAG', sev: 'CRITICAL' as const, amt: 490000 },
      ];

      const p = sampleParticipants[Math.floor(Math.random() * sampleParticipants.length)];
      const f = sampleFacilities[Math.floor(Math.random() * sampleFacilities.length)];
      const m = sampleMeds[Math.floor(Math.random() * sampleMeds.length)];
      const s = signals[Math.floor(Math.random() * signals.length)];

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WITA`;

      const newTx: TransactionFeedItem = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        participantId: p,
        facilityId: f,
        medicationId: m,
        riskSignal: s.sig,
        riskSeverity: s.sev,
        amount: s.amt,
      };

      setTransactionFeed((prev) => [newTx, ...prev.slice(0, 19)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const addAuditLog = (action: string, resource: string, details: string, result: 'SUCCESS' | 'DENIED' | 'FAILED' = 'SUCCESS') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WITA`;
    const newLog: AuditLog = {
      id: `AUDIT-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: timeStr,
      user: currentUser ? (currentUser.role === 'ADMIN' ? 'ADMIN001' : 'ANALYST001') : 'SYSTEM',
      action,
      resource,
      result,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (username: string): boolean => {
    const clean = username.trim().toLowerCase();
    if (clean === 'admin.demo' || clean === 'admin') {
      const user = { username: 'admin.demo', role: 'ADMIN' as UserRole, name: 'Administrator Kontrol Sistem 001' };
      setCurrentUser(user);
      addAuditLog('USER_AUTHENTICATION', 'ADMIN_SESSION', 'Autentikasi sesi administrator berhasil');
      return true;
    } else if (clean === 'analyst.demo' || clean === 'analyst') {
      const user = { username: 'analyst.demo', role: 'ANALYST' as UserRole, name: 'Analis Investigasi Utama 001' };
      setCurrentUser(user);
      addAuditLog('USER_AUTHENTICATION', 'ANALYST_SESSION', 'Autentikasi sesi analis intelijen risiko berhasil');
      return true;
    }
    return false;
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', 'SESSION', 'Pengguna mengakhiri sesi terminal');
    setCurrentUser(null);
  };

  const updateInvestigationStatus = (id: string, status: AlertStatus, resolutionSummary?: string) => {
    setInvestigations((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          status,
          resolutionSummary: resolutionSummary ?? current.resolutionSummary,
        },
      };
    });

    // Also sync the alert status if connected
    const inv = investigations[id];
    if (inv?.alertId) {
      setAlerts((prevAlerts) =>
        prevAlerts.map((alt) => (alt.id === inv.alertId ? { ...alt, status } : alt))
      );
    }

    addAuditLog('UPDATE_INVESTIGATION_STATUS', id, `Keputusan investigasi diubah menjadi [${status}]`);
  };

  const addInvestigationNote = (id: string, content: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WITA`;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      author: currentUser?.role === 'ADMIN' ? 'ADMIN001' : 'ANALYST001',
      timestamp: timeStr,
      content,
    };

    setInvestigations((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          notes: [...current.notes, newNote],
        },
      };
    });

    addAuditLog('APPEND_INVESTIGATION_NOTE', id, `Catatan analisis ditambahkan: "${content.substring(0, 30)}..."`);
  };

  const updateRiskRule = (id: string, updates: Partial<RiskRule>) => {
    setRiskRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, lastUpdated: 'Baru saja' } : r))
    );
    addAuditLog('UPDATE_RISK_RULE', id, `Pembaruan konfigurasi rule bobot ${updates.weight ?? 'status'}`);
  };

  const toggleUserStatus = (id: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    addAuditLog('TOGGLE_USER_STATUS', id, 'Status akun pengguna diubah');
  };

  const clearCommandResult = () => {
    setLastCommandResult(null);
  };

  const executeCommand = (rawCmd: string): CommandVisualResult => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      return {
        command: rawCmd,
        type: 'system',
        title: 'Command kosong',
        rawText: 'Ketik "help" untuk melihat daftar command yang didukung.',
      };
    }

    setCommandHistory((prev) => {
      const filtered = prev.filter((c) => c !== trimmed);
      return [trimmed, ...filtered].slice(0, 20);
    });

    const lower = trimmed.toLowerCase();
    let result: CommandVisualResult;

    if (lower === 'clear') {
      result = {
        command: rawCmd,
        type: 'system',
        title: 'Terminal dibersihkan',
        rawText: '[OK] Layar dan hasil terminal telah di-reset.',
      };
      setLastCommandResult(null);
      return result;
    }

    if (lower === 'help') {
      result = {
        command: rawCmd,
        type: 'help',
        title: 'PANDUAN PERINTAH TERMINAL RXGUARD',
        rawText: `
Daftar perintah yang didukung:
  search peserta [ID]      - Analisis risiko peserta (cth: search peserta P00182)
  search obat [ID]         - Profil risiko peresepan obat (cth: search obat MEDX)
  search fasilitas [ID]    - Audit risiko faskes (cth: search fasilitas FKTP0182)
  risk critical            - Tampilkan daftar alert tingkat KRITIS
  risk high                - Tampilkan daftar alert tingkat TINGGI
  network [ID]             - Eksplorasi graf relasi entitas (cth: network P00182)
  investigate [ID]         - Buka lembar investigasi (cth: investigate INV0281)
  alerts                   - Buka daftar risk alert aktif
  clear                    - Bersihkan hasil terminal
  help                     - Tampilkan panduan ini
        `.trim(),
      };
    } else if (lower.startsWith('search peserta')) {
      const id = trimmed.split(/\s+/)[2]?.toUpperCase();
      const p = participants.find((item) => item.id.toUpperCase() === id) || participants[0];
      if (p) {
        result = {
          command: rawCmd,
          type: 'participant',
          title: `PESERTA ${p.id}`,
          statusText: p.status,
          riskScore: p.riskScore,
          riskLevel: p.riskLevel,
          signals: p.signals,
          entityId: p.id,
          targetRoute: `/terminal/participants?id=${p.id}`,
        };
      } else {
        result = {
          command: rawCmd,
          type: 'not_found',
          title: `Peserta ${id || ''} Tidak Ditemukan`,
          rawText: `Entitas pseudonym peserta tidak terdaftar dalam database simulasi.`,
        };
      }
    } else if (lower.startsWith('search obat')) {
      const id = trimmed.split(/\s+/)[2]?.toUpperCase();
      const m = medications.find((item) => item.id.toUpperCase() === id) || medications[0];
      if (m) {
        result = {
          command: rawCmd,
          type: 'medication',
          title: `OBAT ${m.id} - ${m.name}`,
          statusText: m.category,
          riskScore: m.riskScore,
          riskLevel: m.riskScore > 80 ? 'TINGGI' : 'SEDANG',
          signals: m.signals,
          entityId: m.id,
          targetRoute: `/terminal/medications?id=${m.id}`,
        };
      } else {
        result = {
          command: rawCmd,
          type: 'not_found',
          title: `Obat ${id || ''} Tidak Ditemukan`,
          rawText: `Zat aktif/kode obat simulasi tidak ditemukan dalam katalog risiko.`,
        };
      }
    } else if (lower.startsWith('search fasilitas')) {
      const id = trimmed.split(/\s+/)[2]?.toUpperCase();
      const f = facilities.find((item) => item.id.toUpperCase() === id) || facilities[0];
      if (f) {
        result = {
          command: rawCmd,
          type: 'facility',
          title: `FASKES ${f.id} - ${f.name}`,
          statusText: f.type,
          riskScore: f.riskScore,
          riskLevel: f.status,
          signals: [`${f.riskEvents} kejadian risiko terdeteksi`, `${f.transactionCount} total klaim`],
          entityId: f.id,
          targetRoute: `/terminal/facilities?id=${f.id}`,
        };
      } else {
        result = {
          command: rawCmd,
          type: 'not_found',
          title: `Fasilitas ${id || ''} Tidak Ditemukan`,
          rawText: `Kode faskes tidak ditemukan dalam registry simulasi.`,
        };
      }
    } else if (lower === 'risk critical' || lower === 'risk high') {
      const severity = lower.includes('critical') ? 'CRITICAL' : 'HIGH';
      result = {
        command: rawCmd,
        type: 'filter',
        title: `FILTER RISK ALERTS: ${severity}`,
        statusText: `Menampilkan semua notifikasi risiko berkategori ${severity}`,
        targetRoute: `/terminal/alerts?severity=${severity}`,
        rawText: `Ditemukan sinyal anomali prioritas tinggi dalam feed intelijen.`,
      };
    } else if (lower.startsWith('network')) {
      const id = trimmed.split(/\s+/)[1]?.toUpperCase() || 'P00182';
      result = {
        command: rawCmd,
        type: 'participant',
        title: `GRAF JARINGAN: ${id}`,
        statusText: 'Eksplorasi topologi relasi klaim',
        targetRoute: `/terminal/network?focus=${id}`,
        rawText: `Memetakan relasi klaim, fasilitas rujukan, dan sirkulasi obat terhubung entitas ${id}.`,
      };
    } else if (lower.startsWith('investigate')) {
      const id = trimmed.split(/\s+/)[1]?.toUpperCase() || 'INV0281';
      // If it's an alert ID like ALERT0281, find its investigation
      let invId = id;
      if (id.startsWith('ALERT')) {
        const alt = alerts.find((a) => a.id === id);
        if (alt?.investigationId) invId = alt.investigationId;
      }
      const inv = investigations[invId] || investigations['INV0281'];
      result = {
        command: rawCmd,
        type: 'investigation',
        title: `INVESTIGASI ${inv.id}`,
        statusText: `Status: ${inv.status}`,
        riskScore: inv.riskScore,
        riskLevel: inv.riskLevel,
        signals: inv.signals.map((s) => `${s.label} (+${s.weight})`),
        entityId: inv.id,
        targetRoute: `/terminal/investigations?id=${inv.id}`,
      };
    } else if (lower === 'alerts') {
      result = {
        command: rawCmd,
        type: 'filter',
        title: 'DAFTAR NOTIFIKASI RISIKO',
        statusText: `${alerts.length} Total Risk Alerts Aktif`,
        targetRoute: `/terminal/alerts`,
        rawText: `Memuat tabel deteksi anomali operasional real-time.`,
      };
    } else {
      result = {
        command: rawCmd,
        type: 'not_found',
        title: `Perintah "${trimmed}" Tidak Dikenal`,
        rawText: `Sintaks tidak valid. Ketik "help" untuk panduan perintah terminal.`,
      };
    }

    addAuditLog('EXECUTE_TERMINAL_COMMAND', trimmed, `Kueri command terminal: ${trimmed}`);
    setLastCommandResult(result);
    return result;
  };

  return (
    <TerminalContext.Provider
      value={{
        currentUser,
        login,
        logout,
        participants,
        medications,
        facilities,
        alerts,
        investigations,
        transactionFeed,
        auditLogs,
        riskRules,
        systemUsers,
        updateInvestigationStatus,
        addInvestigationNote,
        updateRiskRule,
        toggleUserStatus,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        commandHistory,
        lastCommandResult,
        executeCommand,
        clearCommandResult,
        addAuditLog,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
