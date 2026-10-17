import React from 'react';
import { History, CheckCircle2, AlertCircle, Clock, RefreshCw, Cpu, Layers } from 'lucide-react';
import { ResearchRun } from '../types';

interface RunsHistoryViewProps {
  runs: ResearchRun[];
  onRerun: () => void;
  rerunning: boolean;
}

export const RunsHistoryView: React.FC<RunsHistoryViewProps> = ({ runs, onRerun, rerunning }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-highlight)' }}>
            Research Execution History
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Each run revisits the inquiry, captures new public sources, and tracks emerging developments over time.
          </p>
        </div>

        <button
          onClick={onRerun}
          disabled={rerunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--red-primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '12px',
            cursor: rerunning ? 'not-allowed' : 'pointer',
            border: '1px solid #ff5252',
          }}
        >
          <RefreshCw size={13} className={rerunning ? 'spin-icon' : ''} />
          <span>{rerunning ? 'Executing Run...' : 'Re-Run Research Now'}</span>
        </button>
      </div>

      {/* Runs List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {runs.map((run) => (
          <div
            key={run.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-highlight)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  RUN #{run.run_number}
                </span>

                <span className={`badge-status ${run.status}`}>
                  {run.status}
                </span>

                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}>
                  {run.mode_used}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} />
                <span>{new Date(run.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Change summary */}
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'var(--text-dim)',
              lineHeight: '1.5',
              marginBottom: '12px',
            }}>
              {run.summary_of_changes || 'Initial baseline execution completed.'}
            </div>

            {/* Metrics */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              <span>Sources Tracked: {run.sources_found_count}</span>
              <span>•</span>
              <span>Claims Verified: {run.claims_extracted_count}</span>
              <span>•</span>
              <span>Entities Mapped: {run.entities_discovered_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
