import React, { useState } from 'react';
import { Cpu, ShieldCheck, Database, RefreshCw, AlertCircle, CheckCircle2, Lock, Terminal } from 'lucide-react';
import { SystemHealth } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  systemHealth: SystemHealth | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ systemHealth, onRefreshHealth }) => {
  const [checking, setChecking] = useState(false);
  const [customMsg, setCustomMsg] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setChecking(true);
    setCustomMsg(null);
    try {
      await onRefreshHealth();
      setCustomMsg("Diagnostic ping completed successfully.");
    } catch (err: any) {
      setCustomMsg(`Diagnostic error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const isAiOnline = systemHealth?.ai_provider?.reachable && systemHealth?.ai_provider?.model_installed;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-highlight)', marginBottom: '4px' }}>
          System Diagnostics & Engine Configuration
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Operational status, safety protections, and local inference provider checks.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* AI Provider Section */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={20} color={isAiOnline ? '#34d399' : '#ff9800'} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                Local Inference Engine (Ollama)
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge-status ${isAiOnline ? 'COMPLETED' : 'PENDING'}`}>
                {isAiOnline ? 'ONLINE • MODEL READY' : 'FALLBACK MODE ACTIVE'}
              </span>

              <button
                onClick={handleTestConnection}
                disabled={checking}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-dim)',
                  fontSize: '12px',
                }}
              >
                <RefreshCw size={12} className={checking ? 'spin-icon' : ''} />
                <span>Test Reachability</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '16px',
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>OLLAMA ENDPOINT</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                {systemHealth?.ai_provider?.base_url || 'http://127.0.0.1:11434'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>CONFIGURED MODEL</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                {systemHealth?.ai_provider?.configured_model || 'llama3:latest'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>FALLBACK STATUS</div>
              <div style={{ color: '#34d399', fontWeight: 500 }}>
                Rule-Based Extractor Available
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Zero Cost Guarantee:</strong> RED THREAD never requires paid OpenAI, Anthropic, or external API keys. If your local Ollama instance is offline or the model is not installed, RED THREAD seamlessly activates its deterministic extraction pipeline.
            </p>
          </div>
        </div>

        {/* Security & SSRF Ingestion Safeguards */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="#34d399" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Open-Source Ingestion & SSRF Protection
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle2 size={13} />
                <span>SSRF Defense Active</span>
              </div>
              <p style={{ color: 'var(--text-dim)', lineHeight: '1.5' }}>
                All source URLs are validated against prohibited loopback (127.0.0.1), RFC1918 private subnets, link-local, and cloud metadata (169.254.169.254) endpoints before any network requests occur.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle2 size={13} />
                <span>Content Size & Timeout Limits</span>
              </div>
              <p style={{ color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Web article downloads are restricted to 512KB and bounded by a 10-second timeout. HTML is sanitized with BeautifulSoup to strip active scripts and stylesheets.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle2 size={13} />
                <span>Strict Citation Mapping</span>
              </div>
              <p style={{ color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Reports enforce stable internal keys ([S1], [S2]) mapped exclusively to stored sources. Hallucinated external citation URLs are automatically detected and rejected.
              </p>
            </div>
          </div>
        </div>

        {/* Database & Application Status */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Database size={20} color="#60a5fa" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Storage & Application Readiness
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '13px',
          }}>
            <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>DATABASE ENGINE</div>
              <div style={{ color: 'var(--text-highlight)', fontWeight: 600, marginTop: '2px' }}>SQLite / PostgreSQL</div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>DATABASE STATE</div>
              <div style={{ color: '#34d399', fontWeight: 600, marginTop: '2px' }}>{systemHealth?.database || 'CONNECTED'}</div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>STORED INVESTIGATIONS</div>
              <div style={{ color: 'var(--text-highlight)', fontWeight: 600, marginTop: '2px' }}>{systemHealth?.investigation_count || 0} Records</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
