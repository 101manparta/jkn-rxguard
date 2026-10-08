export type RiskLevel = 'RENDAH' | 'SEDANG' | 'MENCURIGAKAN' | 'TINGGI' | 'KRITIS';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'OPEN' | 'UNDER REVIEW' | 'ESCALATED' | 'FALSE POSITIVE' | 'RESOLVED';

export type UserRole = 'ANALYST' | 'ADMIN' | 'AUDITOR';

export interface Participant {
  id: string; // e.g. P00182
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  facilitiesCount: number;
  medicationEvents: number;
  lastActivity: string;
  signals: string[];
  associatedFacilities: string[];
  associatedMedications: string[];
  status: 'Aktif' | 'Perlu Ditinjau' | 'Dalam Investigasi' | 'Selesai';
}

export interface Medication {
  id: string; // e.g. MEDX
  name: string; // e.g. Simvastatin-X 20mg (Simulasi)
  category: string; // e.g. Kardiovaskular, Endokrin, Analgesik Khusus
  transactionCount: number;
  facilityCount: number;
  riskEvents: number;
  riskScore: number;
  signals: string[];
  refillCycleDays: number;
}

export interface Facility {
  id: string; // e.g. FKTP0182
  name: string; // e.g. FKTP Pratama Sehat Mandiri
  type: 'FKTP Klinik Pratama' | 'FKTP Puskesmas' | 'FKRTL RS Tipe C' | 'FKRTL RS Tipe B';
  region: string; // e.g. Wilayah Operasional Timur
  transactionCount: number;
  riskEvents: number;
  riskScore: number;
  status: 'Normal' | 'Pengawasan' | 'Audit Khusus';
  lastInspection: string;
}

export interface RiskAlert {
  id: string; // e.g. ALERT0281
  investigationId?: string; // e.g. INV0281
  timestamp: string;
  entityId: string;
  entityType: 'PARTICIPANT' | 'FACILITY' | 'MEDICATION';
  riskType: string;
  severity: AlertSeverity;
  riskScore: number;
  status: AlertStatus;
  summary: string;
  facilityId: string;
  medicationId: string;
}

export interface SignalBreakdown {
  label: string;
  weight: number;
  description: string;
}

export interface InvestigationTimelineItem {
  date: string;
  time: string;
  facilityId: string;
  facilityName: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  flag?: string;
  riskFlagSeverity?: 'low' | 'medium' | 'high';
}

export interface Investigation {
  id: string; // e.g. INV0281
  alertId: string;
  targetParticipantId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  assignedTo: string;
  openedAt: string;
  evidence: {
    transactionCount: number;
    facilityCount: number;
    medicationCount: number;
    timeframeDays: number;
  };
  signals: SignalBreakdown[];
  timeline: InvestigationTimelineItem[];
  notes: Array<{
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }>;
  resolutionSummary?: string;
}

export interface TransactionFeedItem {
  id: string; // e.g. TX-9841
  timestamp: string;
  participantId: string;
  facilityId: string;
  medicationId: string;
  riskSignal: string;
  riskSeverity: AlertSeverity;
  amount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details: string;
}

export interface RiskRule {
  id: string;
  name: string;
  code: string;
  weight: number; // 0 - 100
  status: 'ACTIVE' | 'DISABLED';
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
  accessCount: number;
}

export interface NetworkNodeData {
  id: string;
  label: string;
  type: 'participant' | 'facility' | 'medication' | 'prescription' | 'alert';
  riskScore: number;
  degree?: number;
  subtitle?: string;
}

export interface NetworkEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
}
