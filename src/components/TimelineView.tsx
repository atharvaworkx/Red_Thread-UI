import React, { useMemo } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { TimelineEvent, Source } from '../types';

interface TimelineViewProps {
  events: TimelineEvent[];
  sources: Source[];
  onOpenSourceModal: (source: Source) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  sources,
  onOpenSourceModal,
}) => {
  const sourcesMap = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => {
      map.set(s.citation_key, s);
      map.set(s.id, s);
    });
    return map;
  }, [sources]);

  if (events.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '36px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <Clock size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <p>No dated timeline events extracted for this investigation yet.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px 32px',
    }}>
      <div style={{
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '24px',
      }}>
        CHRONOLOGICAL DEVELOPMENTS TIMELINE ({events.length} EVENTS)
      </div>

      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Continuous vertical timeline line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: 'linear-gradient(180deg, var(--red-primary) 0%, rgba(229, 57, 53, 0.2) 100%)',
        }} />

        <div style={{ display: 'grid', gap: '24px' }}>
          {events.map((ev) => {
            const src = ev.source_citation_key ? sourcesMap.get(ev.source_citation_key) : null;

            return (
              <div key={ev.id} style={{ position: 'relative' }}>
                {/* Node dot on the vertical line */}
                <div style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--bg-app)',
                  border: '2px solid var(--red-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px var(--red-glow)',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b6b' }} />
                </div>

                {/* Event Card */}
                <div style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  transition: 'border 0.15s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--red-primary)',
                      fontWeight: 600,
                    }}>
                      <Calendar size={13} />
                      <span>{ev.event_date}</span>
                    </div>

                    {ev.source_citation_key && (
                      <button
                        onClick={() => src && onOpenSourceModal(src)}
                        className="citation-badge"
                        title={src ? `${src.title} (${src.source_name})` : undefined}
                      >
                        [{ev.source_citation_key}] {src ? src.source_name : ''}
                      </button>
                    )}
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-highlight)', marginBottom: '6px' }}>
                    {ev.title}
                  </h4>

                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
