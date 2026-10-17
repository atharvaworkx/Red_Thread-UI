import React, { useState } from 'react';
import {
  FileText,
  Shield,
  Network,
  Clock,
  Database,
  History,
  RefreshCw,
  Printer,
  Sparkles,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { InvestigationDetail, Source } from '../types';
import { ResearchReportView } from './ResearchReportView';
import { EvidenceExplorer } from './EvidenceExplorer';
import { EntityGraphView } from './EntityGraphView';
import { TimelineView } from './TimelineView';
import { SourcesTable } from './SourcesTable';
import { RunsHistoryView } from './RunsHistoryView';

interface WorkspaceProps {
  investigation: InvestigationDetail;
  onOpenSourceModal: (source: Source) => void;
  onRerunResearch: () => void;
  rerunning: boolean;
  onBackToCommand: () => void;
}

type WorkspaceTab = 'report' | 'evidence' | 'entities' | 'timeline' | 'sources' | 'runs';

export const Workspace: React.FC<WorkspaceProps> = ({
  investigation,
  onOpenSourceModal,
  onRerunResearch,
  rerunning,
  onBackToCommand,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('report');

  const latestRun = investigation.runs && investigation.runs.length > 0 ? investigation.runs[0] : null;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={onBackToCommand}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-highlight)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={14} />
          <span>Back to Command Center</span>
        </button>
      </div>

      {/* Investigation Dossier Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle red accent line at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #e53935 0%, rgba(229, 57, 53, 0.2) 100%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '880px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className={`badge-status ${investigation.status}`}>
                {investigation.is_demo ? 'CURATED DEMO' : investigation.status}
              </span>

              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-dim)',
                border: '1px solid var(--border-subtle)',
              }}>
                {investigation.mode}
              </span>

              {latestRun && (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  RUN #{latestRun.run_number}
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-highlight)',
              lineHeight: '1.3',
              marginBottom: '10px',
            }}>
              {investigation.title}
            </h1>

            <div style={{
              fontSize: '14px',
              color: 'var(--text-dim)',
              lineHeight: '1.6',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Primary Inquiry:
              </span>
              {investigation.research_question}
            </div>
          </div>

          {/* Re-run and refresh controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <button
              onClick={onRerunResearch}
              disabled={rerunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: rerunning ? 'not-allowed' : 'pointer',
                border: '1px solid #ff5252',
                boxShadow: '0 0 14px rgba(229, 57, 53, 0.35)',
              }}
            >
              <RefreshCw size={14} className={rerunning ? 'spin-icon' : ''} />
              <span>{rerunning ? 'Updating Story...' : 'Re-Run Research'}</span>
            </button>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
              Last executed {new Date(investigation.updated_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
        }}>
          <div><strong style={{ color: 'var(--text-highlight)' }}>{investigation.sources.length}</strong> Ingested Sources</div>
          <div>•</div>
          <div><strong style={{ color: 'var(--text-highlight)' }}>{investigation.claims.length}</strong> Extracted Claims</div>
          <div>•</div>
          <div><strong style={{ color: 'var(--text-highlight)' }}>{investigation.entities.length}</strong> Connected Entities</div>
          <div>•</div>
          <div><strong style={{ color: 'var(--text-highlight)' }}>{investigation.timeline_events.length}</strong> Timeline Events</div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'report', label: 'Intelligence Report', icon: <FileText size={15} /> },
          { id: 'evidence', label: `Evidence & Claims (${investigation.claims.length})`, icon: <Shield size={15} /> },
          { id: 'entities', label: `Entity Network (${investigation.entities.length})`, icon: <Network size={15} /> },
          { id: 'timeline', label: `Timeline (${investigation.timeline_events.length})`, icon: <Clock size={15} /> },
          { id: 'sources', label: `Sources (${investigation.sources.length})`, icon: <Database size={15} /> },
          { id: 'runs', label: `Execution History (${investigation.runs.length})`, icon: <History size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as WorkspaceTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--text-highlight)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--red-primary)' : '2px solid transparent',
              background: 'transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'report' && (
          <ResearchReportView
            report={investigation.report}
            sources={investigation.sources}
            investigationTitle={investigation.title}
            investigationId={investigation.id}
            onOpenSourceModal={onOpenSourceModal}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceExplorer
            claims={investigation.claims}
            sources={investigation.sources}
            onOpenSourceModal={onOpenSourceModal}
          />
        )}

        {activeTab === 'entities' && (
          <EntityGraphView
            entities={investigation.entities}
            relationships={investigation.relationships}
            sources={investigation.sources}
            onOpenSourceModal={onOpenSourceModal}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            events={investigation.timeline_events}
            sources={investigation.sources}
            onOpenSourceModal={onOpenSourceModal}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesTable
            sources={investigation.sources}
            onOpenSourceModal={onOpenSourceModal}
          />
        )}

        {activeTab === 'runs' && (
          <RunsHistoryView
            runs={investigation.runs}
            onRerun={onRerunResearch}
            rerunning={rerunning}
          />
        )}
      </div>
    </div>
  );
};
