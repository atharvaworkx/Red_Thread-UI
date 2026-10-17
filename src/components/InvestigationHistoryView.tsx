import React, { useState } from 'react';
import { Search, Trash2, ArrowRight, Activity, Calendar, Layers, Database } from 'lucide-react';
import { InvestigationListItem } from '../types';

interface InvestigationHistoryViewProps {
  investigations: InvestigationListItem[];
  onOpenInvestigation: (id: string) => void;
  onDeleteInvestigation: (id: string) => void;
}

export const InvestigationHistoryView: React.FC<InvestigationHistoryViewProps> = ({
  investigations,
  onOpenInvestigation,
  onDeleteInvestigation,
}) => {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = investigations.filter((inv) =>
    inv.title.toLowerCase().includes(search.toLowerCase()) ||
    inv.research_question.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this investigation and its evidence?")) {
      onDeleteInvestigation(id);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-highlight)' }}>
            Investigation Archive
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Search and reopen saved intelligence records and multi-run tracking histories.
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          width: '320px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search saved investigations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-highlight)',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Investigation Cards */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <Database size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>No investigations found matching your search.</p>
          </div>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              onClick={() => onOpenInvestigation(inv.id)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.background = 'var(--bg-surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge-status ${inv.status}`}>
                    {inv.is_demo ? 'CURATED DEMO' : inv.status}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    RUN #{inv.latest_run_number}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    • Updated {new Date(inv.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-highlight)',
                  marginBottom: '4px',
                }}>
                  {inv.title}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {inv.research_question}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div><strong style={{ color: 'var(--text-highlight)' }}>{inv.sources_count}</strong> sources</div>
                  <div><strong style={{ color: 'var(--text-highlight)' }}>{inv.claims_count}</strong> claims</div>
                </div>

                {!inv.is_demo && (
                  <button
                    onClick={(e) => handleDelete(e, inv.id)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    title="Delete investigation"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
