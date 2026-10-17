import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Claim, Source, ClaimEvidenceStatus } from '../types';

interface EvidenceExplorerProps {
  claims: Claim[];
  sources: Source[];
  onOpenSourceModal: (source: Source) => void;
}

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({
  claims,
  sources,
  onOpenSourceModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const sourcesMap = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => {
      map.set(s.citation_key, s);
      map.set(s.id, s);
    });
    return map;
  }, [sources]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchesSearch = c.claim_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.confidence_assessment && c.confidence_assessment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.dispute_reason && c.dispute_reason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || c.evidence_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  const getStatusBadge = (status: ClaimEvidenceStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-supported-bg)',
            color: 'var(--status-supported-text)',
            border: '1px solid var(--status-supported-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600,
          }}>
            <CheckCircle2 size={12} />
            CORROBORATED
          </span>
        );
      case 'SINGLE_SOURCE':
        return (
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-single-bg)',
            color: 'var(--status-single-text)',
            border: '1px solid var(--status-single-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600,
          }}>
            <FileText size={12} />
            SINGLE SOURCE
          </span>
        );
      case 'DISPUTED':
        return (
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-disputed-bg)',
            color: 'var(--status-disputed-text)',
            border: '1px solid var(--status-disputed-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600,
          }}>
            <AlertTriangle size={12} />
            DISPUTED
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-unverified-bg)',
            color: 'var(--status-unverified-text)',
            border: '1px solid var(--status-unverified-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600,
          }}>
            <HelpCircle size={12} />
            UNVERIFIED
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(148, 163, 184, 0.1)',
            color: 'var(--text-dim)',
            border: '1px solid var(--border-medium)',
          }}>
            {status}
          </span>
        );
    }
  };

  const statusCounts = useMemo(() => {
    return {
      ALL: claims.length,
      SUPPORTED: claims.filter((c) => c.evidence_status === 'SUPPORTED').length,
      SINGLE_SOURCE: claims.filter((c) => c.evidence_status === 'SINGLE_SOURCE').length,
      DISPUTED: claims.filter((c) => c.evidence_status === 'DISPUTED').length,
      UNVERIFIED: claims.filter((c) => c.evidence_status === 'UNVERIFIED').length,
    };
  }, [claims]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filters and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Search */}
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
            placeholder="Search claims and evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${statusCounts.ALL})` },
            { id: 'SUPPORTED', label: `Corroborated (${statusCounts.SUPPORTED})` },
            { id: 'SINGLE_SOURCE', label: `Single Source (${statusCounts.SINGLE_SOURCE})` },
            { id: 'DISPUTED', label: `Disputed (${statusCounts.DISPUTED})` },
            { id: 'UNVERIFIED', label: `Unverified (${statusCounts.UNVERIFIED})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 500,
                background: statusFilter === tab.id ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                color: statusFilter === tab.id ? 'var(--text-highlight)' : 'var(--text-dim)',
                border: statusFilter === tab.id ? '1px solid var(--red-border)' : '1px solid var(--border-subtle)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredClaims.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '36px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <FileText size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>No claims match the active filter criteria.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              style={{
                background: 'var(--bg-surface)',
                border: claim.evidence_status === 'DISPUTED' 
                  ? '1px solid rgba(245, 158, 11, 0.4)' 
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                position: 'relative',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Top row: Status & Confidence */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getStatusBadge(claim.evidence_status)}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {claim.confidence_assessment}
                  </span>
                </div>

                {/* Citation Keys linked */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sources:</span>
                  {(claim.source_citation_keys || []).map((key) => {
                    const src = sourcesMap.get(key);
                    return (
                      <button
                        key={key}
                        onClick={() => src && onOpenSourceModal(src)}
                        className="citation-badge"
                        title={src ? `${src.title} (${src.source_name})` : undefined}
                      >
                        [{key}]
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Claim Body Text */}
              <p style={{
                fontSize: '14px',
                color: 'var(--text-main)',
                lineHeight: '1.6',
                marginBottom: claim.dispute_reason ? '12px' : '6px',
              }}>
                {claim.claim_text}
              </p>

              {/* Dispute Explanation if status is DISPUTED */}
              {claim.dispute_reason && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>Identified Disagreement / Competing Account: </span>
                    <span>{claim.dispute_reason}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
