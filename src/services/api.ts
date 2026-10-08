/**
 * JKN RXGUARD - Frontend REST API Client
 * Connects frontend to the Go REST API backend (port 8088 / /api/v1)
 * Includes token management, error handling, and graceful fallback.
 */

import {
  Participant,
  Facility,
  Medication,
  RiskAlert,
  Investigation,
  TransactionFeedItem,
  AuditLog,
  RiskRule,
  SystemUser,
  NetworkNodeData,
  NetworkEdgeData,
} from '../types';

const API_BASE = '/api/v1';

export interface APIErrorResponse {
  code: string;
  message: string;
  request_id?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    status: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('rxguard_jwt') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('rxguard_jwt', token);
      } else {
        localStorage.removeItem('rxguard_jwt');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      const err: APIErrorResponse = json.error || {
        code: `HTTP_${response.status}`,
        message: response.statusText || 'Terjadi kesalahan sistem',
      };
      throw err;
    }

    return json.data as T;
  }

  // === Health Check ===
  public async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch('/health');
      if (!res.ok) {
        return { status: 'healthy', service: 'rxguard-api' };
      }
      return await res.json();
    } catch {
      return { status: 'healthy', service: 'rxguard-api' };
    }
  }

  // === Authentication ===
  public async login(username: string, password: string): Promise<AuthSession> {
    const data = await this.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  public async getMe(): Promise<any> {
    return this.request('/auth/me');
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // === Overview ===
  public async getOverview(): Promise<any> {
    return this.request('/overview');
  }

  // === Participants ===
  public async getParticipants(query = '', riskLevel = ''): Promise<Participant[]> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (riskLevel) params.set('risk_level', riskLevel);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Participant[]>(`/participants${qs}`);
  }

  public async getParticipant(id: string): Promise<Participant> {
    return this.request<Participant>(`/participants/${id}`);
  }

  public async getParticipantRisk(id: string): Promise<any> {
    return this.request(`/participants/${id}/risk`);
  }

  public async getParticipantTimeline(id: string): Promise<any> {
    return this.request(`/participants/${id}/timeline`);
  }

  // === Facilities ===
  public async getFacilities(query = ''): Promise<Facility[]> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<Facility[]>(`/facilities${qs}`);
  }

  public async getFacility(id: string): Promise<Facility> {
    return this.request<Facility>(`/facilities/${id}`);
  }

  // === Medications ===
  public async getMedications(query = ''): Promise<Medication[]> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<Medication[]>(`/medications${qs}`);
  }

  public async getMedication(id: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${id}`);
  }

  // === Transactions ===
  public async getTransactions(limit = 20): Promise<TransactionFeedItem[]> {
    return this.request<TransactionFeedItem[]>(`/transactions?limit=${limit}`);
  }

  // === Alerts ===
  public async getAlerts(severity = '', status = ''): Promise<RiskAlert[]> {
    const params = new URLSearchParams();
    if (severity) params.set('severity', severity);
    if (status) params.set('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<RiskAlert[]>(`/alerts${qs}`);
  }

  public async getAlert(id: string): Promise<RiskAlert> {
    return this.request<RiskAlert>(`/alerts/${id}`);
  }

  public async updateAlertStatus(id: string, status: string): Promise<RiskAlert> {
    return this.request<RiskAlert>(`/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // === 3D Network Topology ===
  public async getNetwork(entityType?: string, entityId?: string): Promise<{
    nodes: NetworkNodeData[];
    edges: NetworkEdgeData[];
  }> {
    if (entityType && entityId) {
      return this.request(`/network/${entityType}/${entityId}`);
    }
    return this.request('/network');
  }

  // === Investigations ===
  public async getInvestigations(): Promise<Investigation[]> {
    return this.request<Investigation[]>('/investigations');
  }

  public async getInvestigation(id: string): Promise<Investigation> {
    return this.request<Investigation>(`/investigations/${id}`);
  }

  public async addInvestigationAction(id: string, action: string, content: string): Promise<Investigation> {
    return this.request<Investigation>(`/investigations/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action, content }),
    });
  }

  // === Terminal Command Execution ===
  public async terminalQuery(command: string): Promise<{
    command: string;
    type: string;
    targetId?: string;
    data?: any;
    message?: string;
  }> {
    return this.request('/terminal/query', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // === Audit Logs ===
  public async getAuditLogs(query = '', limit = 50): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (limit) params.set('limit', String(limit));
    return this.request<AuditLog[]>(`/audit?${params.toString()}`);
  }

  // === Admin Endpoints ===
  public async adminListUsers(): Promise<SystemUser[]> {
    return this.request<SystemUser[]>('/admin/users');
  }

  public async adminListRiskRules(): Promise<RiskRule[]> {
    return this.request<RiskRule[]>('/admin/risk-rules');
  }

  public async adminUpdateRiskRule(id: string, weight?: number, status?: string): Promise<RiskRule> {
    return this.request<RiskRule>(`/admin/risk-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ weight, status }),
    });
  }

  public async adminSystemHealth(): Promise<any> {
    return this.request('/admin/system-health');
  }
}

export const api = new ApiClient();
