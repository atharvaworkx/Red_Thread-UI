import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CommandCenter } from './components/CommandCenter';
import { Workspace } from './components/Workspace';
import { InvestigationHistoryView } from './components/InvestigationHistoryView';
import { SettingsView } from './components/SettingsView';
import { SourceModal } from './components/SourceModal';
import { NewInvestigationModal } from './components/NewInvestigationModal';
import { api } from './services/api';
import {
  InvestigationDetail,
  InvestigationListItem,
  Source,
  SystemHealth,
} from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'command' | 'workspace' | 'history' | 'settings'>('command');
  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<InvestigationDetail | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedSourceModal, setSelectedSourceModal] = useState<Source | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load system health and initial list of investigations
  const loadData = useCallback(async () => {
    try {
      setGlobalError(null);
      const [healthData, invData] = await Promise.all([
        api.getHealth().catch((e) => {
          console.warn("Backend health check failed:", e);
          return null;
        }),
        api.listInvestigations().catch((e) => {
          console.warn("Listing investigations failed:", e);
          return { results: [], count: 0 };
        }),
      ]);

      if (healthData) {
        setSystemHealth(healthData);
      }

      const list = Array.isArray(invData) ? invData : (invData?.results || []);
      setInvestigations(list);

      // If no investigations found at all, automatically seed demo
      if (list.length === 0) {
        try {
          const demo = await api.getDemoInvestigation();
          setInvestigations([
            {
              id: demo.id,
              title: demo.title,
              research_question: demo.research_question,
              status: demo.status,
              mode: demo.mode,
              is_demo: demo.is_demo,
              created_at: demo.created_at,
              updated_at: demo.updated_at,
              error_message: demo.error_message,
              sources_count: demo.sources.length,
              claims_count: demo.claims.length,
              entities_count: demo.entities.length,
              latest_run_number: demo.runs.length || 1,
            },
          ]);
        } catch (e) {
          console.warn("Seeding initial demo failed:", e);
        }
      }
    } catch (err: any) {
      setGlobalError("Unable to connect to the RED THREAD backend. Verify that the Django server is running.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Curated Demo Investigation
  const handleOpenDemo = async () => {
    setActionLoading(true);
    setGlobalError(null);
    try {
      const demo = await api.getDemoInvestigation();
      setActiveInvestigation(demo);
      setCurrentView('workspace');
    } catch (err: any) {
      setGlobalError(`Failed to load curated demonstration: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open specific investigation by ID
  const handleOpenInvestigation = async (id: string) => {
    setActionLoading(true);
    setGlobalError(null);
    try {
      const inv = await api.getInvestigation(id);
      setActiveInvestigation(inv);
      setCurrentView('workspace');
    } catch (err: any) {
      setGlobalError(`Failed to retrieve investigation: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Create new investigation
  const handleCreateInvestigation = async (question: string, title?: string) => {
    setActionLoading(true);
    setGlobalError(null);
    try {
      const newInv = await api.createInvestigation(question, title);
      setActiveInvestigation(newInv);
      await loadData();
      setCurrentView('workspace');
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Re-run research on active investigation
  const handleRerunResearch = async () => {
    if (!activeInvestigation) return;
    setRerunning(true);
    setGlobalError(null);
    try {
      const updated = await api.runResearch(activeInvestigation.id);
      setActiveInvestigation(updated);
      await loadData();
    } catch (err: any) {
      setGlobalError(`Research execution failed: ${err.message}`);
    } finally {
      setRerunning(false);
    }
  };

  // Delete investigation
  const handleDeleteInvestigation = async (id: string) => {
    try {
      await api.deleteInvestigation(id);
      if (activeInvestigation?.id === id) {
        setActiveInvestigation(null);
        setCurrentView('command');
      }
      await loadData();
    } catch (err: any) {
      setGlobalError(`Failed to delete investigation: ${err.message}`);
    }
  };

  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-highlight)',
        gap: '16px',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--red-primary)',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
        }}>
          INITIALIZING RED THREAD INTELLIGENCE STATION...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin-icon {
            animation: spin 1.2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1.2s linear infinite;
        }
      `}</style>

      {/* Primary Station Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        systemHealth={systemHealth}
        hasActiveWorkspace={activeInvestigation !== null}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenDemo={handleOpenDemo}
      />

      {/* Global Error Banner */}
      {globalError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#f87171',
          fontSize: '13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            style={{ color: '#f87171', fontSize: '12px', textDecoration: 'underline' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'command' && (
          <CommandCenter
            recentInvestigations={investigations}
            systemHealth={systemHealth}
            onOpenInvestigation={handleOpenInvestigation}
            onOpenDemo={handleOpenDemo}
            onSubmitNewQuery={(q) => handleCreateInvestigation(q)}
            loading={actionLoading}
          />
        )}

        {currentView === 'workspace' && activeInvestigation && (
          <Workspace
            investigation={activeInvestigation}
            onOpenSourceModal={(s) => setSelectedSourceModal(s)}
            onRerunResearch={handleRerunResearch}
            rerunning={rerunning}
            onBackToCommand={() => setCurrentView('command')}
          />
        )}

        {currentView === 'history' && (
          <InvestigationHistoryView
            investigations={investigations}
            onOpenInvestigation={handleOpenInvestigation}
            onDeleteInvestigation={handleDeleteInvestigation}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            systemHealth={systemHealth}
            onRefreshHealth={loadData}
          />
        )}
      </main>

      {/* Source Viewer Modal */}
      <SourceModal
        source={selectedSourceModal}
        onClose={() => setSelectedSourceModal(null)}
      />

      {/* New Investigation Modal */}
      <NewInvestigationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateInvestigation}
        loading={actionLoading}
      />

      {/* Station Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        background: 'var(--bg-surface)',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--red-primary)', fontWeight: 700 }}>RED THREAD</span>
          <span>•</span>
          <span>RESEARCH & EVIDENCE INTELLIGENCE PLATFORM</span>
        </div>

        <div>
          ZERO-COST LOCAL INFERENCE & DETERMINISTIC CORROBORATION PIPELINE
        </div>
      </footer>
    </div>
  );
};

export default App;
