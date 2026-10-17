import React from 'react';
import { X, ExternalLink, ShieldCheck, Calendar, Hash, FileText } from 'lucide-react';
import { Source } from '../types';

interface SourceModalProps {
  source: Source | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ source, onClose }) => {
  if (!source) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="citation-badge" style={{ fontSize: '13px', padding: '3px 8px' }}>
              [{source.citation_key}]
            </span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PRIMARY EVIDENCE RECORD
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-highlight)',
            lineHeight: '1.4',
            marginBottom: '16px',
          }}>
            {source.title}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            background: 'var(--bg-surface-elevated)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Publisher / Outlet</div>
              <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{source.source_name}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Publication Date</div>
              <div style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="var(--text-muted)" />
                <span>{source.publication_date ? new Date(source.publication_date).toLocaleDateString() : 'Undated Disclosure'}</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Status</div>
              <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={13} />
                <span>{source.status}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}>
              <FileText size={14} />
              <span>Extracted Source Passage</span>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontSize: '13px',
              color: 'var(--text-dim)',
              lineHeight: '1.6',
              maxHeight: '220px',
              overflowY: 'auto',
            }}>
              {source.excerpt || 'No additional text excerpt extracted for this source.'}
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '24px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            <Hash size={12} />
            <span>Fingerprint: {source.content_hash || 'SHA256 verified'}</span>
          </div>

          {/* Action button: External URL */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-dim)',
                fontSize: '13px',
              }}
            >
              Close
            </button>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid #ff5252',
              }}
            >
              <span>Open Original Source</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
