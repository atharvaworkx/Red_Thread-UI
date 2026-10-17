import {
  InvestigationDetail,
  InvestigationListItem,
  SystemHealth,
} from '../types';

const rawBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
const cleanBase = rawBase.replace(/\/+$/, '');
export const API_BASE = cleanBase
  ? (cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`)
  : '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (typeof data === 'object' && data !== null) {
        errorDetail = data.detail || data.error || data.message || JSON.stringify(data);
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health/`);
    return handleResponse<SystemHealth>(res);
  },

  async getAIStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/status/`);
    return handleResponse<any>(res);
  },

  async listInvestigations(): Promise<{ results: InvestigationListItem[]; count: number } | InvestigationListItem[]> {
    const res = await fetch(`${API_BASE}/investigations/`);
    const data = await handleResponse<any>(res);
    // If DRF pagination is used, extract results
    if (data && Array.isArray(data.results)) {
      return data;
    }
    return { results: Array.isArray(data) ? data : [], count: Array.isArray(data) ? data.length : 0 };
  },

  async getInvestigation(id: string): Promise<InvestigationDetail> {
    const res = await fetch(`${API_BASE}/investigations/${id}/`);
    return handleResponse<InvestigationDetail>(res);
  },

  async getDemoInvestigation(): Promise<InvestigationDetail> {
    const res = await fetch(`${API_BASE}/investigations/demo/`);
    return handleResponse<InvestigationDetail>(res);
  },

  async createInvestigation(research_question: string, title?: string): Promise<InvestigationDetail> {
    const res = await fetch(`${API_BASE}/investigations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        research_question,
        title: title || undefined,
      }),
    });
    return handleResponse<InvestigationDetail>(res);
  },

  async runResearch(id: string): Promise<InvestigationDetail> {
    const res = await fetch(`${API_BASE}/investigations/${id}/run-research/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<InvestigationDetail>(res);
  },

  async deleteInvestigation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/investigations/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete investigation (${res.status})`);
    }
  },
};
