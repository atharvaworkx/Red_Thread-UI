import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Database,
  Cpu,
  Clock,
  ExternalLink,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { InvestigationListItem, SystemHealth } from '../types';

interface CommandCenterProps {
  recentInvestigations: InvestigationListItem[];
  systemHealth: SystemHealth | null;
  onOpenInvestigation: (id: string) => void;
  onOpenDemo: () => void;
  onSubmitNewQuery: (query: string) => void;
  loading: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  recentInvestigations,
  systemHealth,
  onOpenInvestigation,
  onOpenDemo,
  onSubmitNewQuery,
  loading,
}) => {
  const [queryInput, setQueryInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onSubmitNewQuery(queryInput.trim());
    }
  };

  const sampleQueries = [
    "Investigate TSMC CoWoS packaging bottlenecks and 2025 expansion plans",
    "Track High-Bandwidth Memory (HBM3e) qualifications between SK Hynix and Samsung",
    "Major technological developments in open-source AI reasoning models",
    "What are the supply chain dependencies for next-gen AI accelerators?",
  ];

  const totalSources = recentInvestigations.reduce((acc, curr) => acc + (curr.sources_count || 0), 0);
  const totalClaims = recentInvestigations.reduce((acc, curr) => acc + (curr.claims_count || 0), 0);
  const isAiOnline = systemHealth?.ai_provider?.reachable && systemHealth?.ai_provider?.model_installed;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '32px 20px 44px',
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(229, 57, 53, 0.1)',
          border: '1px solid rgba(229, 57, 53, 0.3)',
          marginBottom: '16px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-primary)' }} />
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: '#ff6b6b',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            AI Intelligence & Evidence Discovery Platform
          </span>
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
          color: 'var(--text-highlight)',
        }}>
          Every Story Leaves a <span style={{ color: 'var(--red-primary)', textShadow: '0 0 20px rgba(229, 57, 53, 0.35)' }}>Trail</span>.
        </h1>

        <p style={{
          maxWidth: '680px',
          margin: '0 auto 32px',
          fontSize: '15px',
          color: 'var(--text-dim)',
          lineHeight: '1.6',
        }}>
          RED THREAD automates open-source intelligence research. Ingest public disclosures, cross-corroborate claims, map connected entities, surface contradictions, and generate grounded reports with traceable citations.
        </p>

        {/* Prominent Search / Creation Form */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '6px 8px 6px 18px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            transition: 'border 0.2s ease',
          }}>
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Enter an inquiry, technology company, or developing story..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-highlight)',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: queryInput.trim() ? 'var(--red-primary)' : 'var(--bg-surface-elevated)',
                color: queryInput.trim() ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '13px',
                border: queryInput.trim() ? '1px solid #ff5252' : '1px solid var(--border-medium)',
                cursor: queryInput.trim() ? 'pointer' : 'not-allowed',
                boxShadow: queryInput.trim() ? '0 0 14px rgba(229, 57, 53, 0.4)' : 'none',
              }}
            >
              <span>{loading ? 'Investigating...' : 'Investigate'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* Sample Investigation Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>
            Quick Prompts:
          </span>
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQueryInput(q);
                onSubmitNewQuery(q);
              }}
              style={{
                fontSize: '11px',
                color: 'var(--text-dim)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--red-border)';
                e.currentTarget.style.color = 'var(--text-highlight)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Real Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Database size={18} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Saved Investigations
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-highlight)' }}>
              {recentInvestigations.length}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={18} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Public Sources Ingested
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-highlight)' }}>
              {totalSources}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers size={18} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Claims Corroborated
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-highlight)' }}>
              {totalClaims}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: isAiOnline ? 'rgba(52, 211, 153, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            border: isAiOnline ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(100, 116, 139, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cpu size={18} color={isAiOnline ? '#34d399' : '#94a3b8'} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Synthesis Pipeline
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isAiOnline ? '#34d399' : 'var(--text-dim)' }}>
              {isAiOnline ? 'Ollama AI Online' : 'Rule-Based Engine'}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Demonstration Card */}
      <div style={{
        background: 'linear-gradient(180deg, #121620 0%, #0d1017 100%)',
        border: '1px solid rgba(229, 57, 53, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '36px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #e53935, transparent)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 152, 0, 0.15)',
                color: '#ffb74d',
                border: '1px solid rgba(255, 152, 0, 0.35)',
              }}>
                CURATED DEMONSTRATION RECORD
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Baseline intelligence dataset with verified sources
              </span>
            </div>

            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-highlight)',
              marginBottom: '8px',
            }}>
              Global Advanced AI Semiconductor Supply Chain: TSMC, ASML, CoWoS Packaging, and HBM3e Bottlenecks
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '14px' }}>
              Deep investigation tracking physical capacity constraints for next-generation AI accelerators. Features 6 verified primary sources, 10 mapped corporate and technology entities, corroborated claims, and identified disagreements regarding 2025 packaging tool lead times.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>• 6 Public Disclosures (TSMC, ASML, SK Hynix, Reuters)</span>
              <span>• CoWoS & HBM3e Bottleneck Mapping</span>
              <span>• Disputed Tool Delivery Forecasts</span>
            </div>
          </div>

          <button
            onClick={onOpenDemo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--red-primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 0 16px rgba(229, 57, 53, 0.35)',
              alignSelf: 'center',
            }}
          >
            <span>Explore Demo</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Recent Investigations List */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--red-primary)" />
            Recent Investigations
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {recentInvestigations.length} saved records
          </span>
        </div>

        {recentInvestigations.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '36px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <FileText size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>No investigations created yet. Enter an inquiry above or explore the curated demo.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {recentInvestigations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onOpenInvestigation(inv.id)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, marginRight: '16px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: inv.is_demo ? '#ff9800' : (inv.status === 'COMPLETED' ? '#10b981' : '#e53935'),
                    flexShrink: 0,
                  }} />

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-highlight)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                    }}>
                      {inv.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-dim)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {inv.research_question}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div>{inv.sources_count} sources • {inv.claims_count} claims</div>
                    <div>Run #{inv.latest_run_number}</div>
                  </div>

                  <span className={`badge-status ${inv.status}`}>
                    {inv.is_demo ? 'DEMO' : inv.status}
                  </span>

                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
