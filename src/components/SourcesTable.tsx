import React, { useState } from 'react';
import { ExternalLink, Search, ShieldCheck, Globe, Calendar, Hash } from 'lucide-react';
import { Source } from '../types';

interface SourcesTableProps {
  sources: Source[];
  onOpenSourceModal: (source: Source) => void;
}

export const SourcesTable: React.FC<SourcesTableProps> = ({ sources, onOpenSourceModal }) => {
  const [search, setSearch] = useState('');

  const filtered = sources.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.source_name.toLowerCase().includes(search.toLowerCase()) ||
    s.citation_key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          width: '280px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Filter ingested sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-highlight)',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {filtered.length} of {sources.length} sources displayed
        </div>
      </div>

      {/* Sources Grid / Cards */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {filtered.map((source) => (
          <div
            key={source.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
              <button
                onClick={() => onOpenSourceModal(source)}
                className="citation-badge"
                style={{ fontSize: '13px', padding: '4px 8px', flexShrink: 0 }}
              >
                [{source.citation_key}]
              </button>

              <div style={{ minWidth: 0 }}>
                <div
                  onClick={() => onOpenSourceModal(source)}
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-highlight)',
                    cursor: 'pointer',
                    marginBottom: '4px',
                  }}
                >
                  {source.title}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>
                    {source.source_name}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {source.publication_date ? new Date(source.publication_date).toLocaleDateString() : 'Undated'}
                  </span>
                  <span>•</span>
                  <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} />
                    {source.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => onOpenSourceModal(source)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-dim)',
                  fontSize: '12px',
                }}
              >
                Inspect
              </button>

              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-highlight)',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>Link</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
