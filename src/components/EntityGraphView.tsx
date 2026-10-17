import React, { useState, useMemo } from 'react';
import {
  Network,
  List,
  Search,
  Filter,
  Info,
  ExternalLink,
  Building2,
  User,
  Cpu,
  Box,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Entity, EntityRelationship, Source, EntityType } from '../types';

interface EntityGraphViewProps {
  entities: Entity[];
  relationships: EntityRelationship[];
  sources: Source[];
  onOpenSourceModal: (source: Source) => void;
}

export const EntityGraphView: React.FC<EntityGraphViewProps> = ({
  entities,
  relationships,
  sources,
  onOpenSourceModal,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'ALL' || e.entity_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [entities, searchQuery, filterType]);

  const entityTypeColor = (type: EntityType) => {
    switch (type) {
      case 'ORGANIZATION': return '#3b82f6';
      case 'PERSON': return '#f59e0b';
      case 'TECHNOLOGY': return '#10b981';
      case 'PRODUCT': return '#8b5cf6';
      case 'EVENT': return '#f43f5e';
      case 'LOCATION': return '#06b6d4';
      default: return '#94a3b8';
    }
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'ORGANIZATION': return <Building2 size={14} color="#3b82f6" />;
      case 'PERSON': return <User size={14} color="#f59e0b" />;
      case 'TECHNOLOGY': return <Cpu size={14} color="#10b981" />;
      case 'PRODUCT': return <Box size={14} color="#8b5cf6" />;
      case 'EVENT': return <Calendar size={14} color="#f43f5e" />;
      case 'LOCATION': return <MapPin size={14} color="#06b6d4" />;
      default: return <Info size={14} color="#94a3b8" />;
    }
  };

  // Pre-calculate circular / force layout coordinates for the SVG graph
  const nodePositions = useMemo(() => {
    const width = 860;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    const positions: Record<string, { x: number; y: number }> = {};
    const count = entities.length;

    entities.forEach((entity, index) => {
      // Place first 2 central nodes in inner ring if many nodes
      if (count > 6 && index < 2) {
        const innerAngle = (index * 2 * Math.PI) / 2;
        positions[entity.id] = {
          x: centerX + Math.cos(innerAngle) * (radius * 0.45),
          y: centerY + Math.sin(innerAngle) * (radius * 0.45),
        };
      } else {
        const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
        positions[entity.id] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      }
    });

    return positions;
  }, [entities]);

  const selectedEntityRelations = useMemo(() => {
    if (!selectedEntity) return [];
    return relationships.filter(
      (r) => r.source_entity === selectedEntity.id || r.target_entity === selectedEntity.id ||
             r.source_entity_name === selectedEntity.name || r.target_entity_name === selectedEntity.name
    );
  }, [selectedEntity, relationships]);

  const sourcesMap = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => {
      map.set(s.citation_key, s);
      map.set(s.id, s);
    });
    return map;
  }, [sources]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls Bar */}
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
          width: '260px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search entities or topics..."
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

        {/* Filter Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '12px',
              padding: '6px 10px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Types ({entities.length})</option>
            <option value="ORGANIZATION">Organization</option>
            <option value="PERSON">Person</option>
            <option value="TECHNOLOGY">Technology</option>
            <option value="PRODUCT">Product</option>
            <option value="EVENT">Event</option>
            <option value="LOCATION">Location</option>
          </select>
        </div>

        {/* View Toggle (Graph vs List) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px',
        }}>
          <button
            onClick={() => setViewMode('graph')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              background: viewMode === 'graph' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: viewMode === 'graph' ? 'var(--text-highlight)' : 'var(--text-dim)',
            }}
          >
            <Network size={14} />
            <span>Graph View</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              background: viewMode === 'list' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: viewMode === 'list' ? 'var(--text-highlight)' : 'var(--text-dim)',
            }}
          >
            <List size={14} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Graph/List + Details Inspector Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEntity ? '1fr 340px' : '1fr', gap: '16px' }}>
        {/* Interactive SVG Network Graph */}
        {viewMode === 'graph' ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '520px',
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              zIndex: 10,
            }}>
              INTERACTIVE ENTITY NETWORK • CLICK NODE TO INSPECT EVIDENCE
            </div>

            <svg
              viewBox="0 0 860 480"
              style={{ width: '100%', height: '500px', display: 'block' }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#e53935" opacity="0.6" />
                </marker>
              </defs>

              {/* Background subtle grid */}
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Relationship Links */}
              {relationships.map((rel, idx) => {
                const sPos = nodePositions[rel.source_entity] || Object.values(nodePositions)[0];
                const tPos = nodePositions[rel.target_entity] || Object.values(nodePositions)[1];
                if (!sPos || !tPos) return null;

                const isConnectedToSelected = selectedEntity && 
                  (selectedEntity.id === rel.source_entity || selectedEntity.id === rel.target_entity ||
                   selectedEntity.name === rel.source_entity_name || selectedEntity.name === rel.target_entity_name);

                return (
                  <g key={idx}>
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={isConnectedToSelected ? '#e53935' : '#2b3446'}
                      strokeWidth={isConnectedToSelected ? '2' : '1'}
                      strokeDasharray={rel.is_inference ? '4 4' : 'none'}
                      markerEnd="url(#arrow)"
                    />
                    {/* Middle label */}
                    <text
                      x={(sPos.x + tPos.x) / 2}
                      y={(sPos.y + tPos.y) / 2 - 4}
                      fill={isConnectedToSelected ? '#ff6b6b' : '#64748b'}
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {rel.relation_type.replace(/_/g, ' ')}
                    </text>
                  </g>
                );
              })}

              {/* Entity Nodes */}
              {filteredEntities.map((entity) => {
                const pos = nodePositions[entity.id];
                if (!pos) return null;
                const isSelected = selectedEntity?.id === entity.id;
                const color = entityTypeColor(entity.entity_type);

                return (
                  <g
                    key={entity.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedEntity(isSelected ? null : entity)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer glow circle */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#e53935"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                    )}

                    <circle
                      r="16"
                      fill="#0f131a"
                      stroke={isSelected ? '#e53935' : color}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Small inner dot */}
                    <circle r="4" fill={color} />

                    {/* Label below node */}
                    <text
                      y="30"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="11"
                      fontWeight={isSelected ? 600 : 500}
                      fontFamily="var(--font-sans)"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {entity.name.length > 20 ? `${entity.name.substring(0, 18)}...` : entity.name}
                    </text>

                    {/* Type sub-label */}
                    <text
                      y="42"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {entity.entity_type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* List Alternative View */
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'grid',
            gap: '8px',
          }}>
            {filteredEntities.map((entity) => {
              const isSelected = selectedEntity?.id === entity.id;
              const color = entityTypeColor(entity.entity_type);

              return (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntity(isSelected ? null : entity)}
                  style={{
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                    border: isSelected ? '1px solid var(--red-border)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getEntityIcon(entity.entity_type)}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                        {entity.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {entity.description || 'Monitored research entity'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: `${color}15`,
                      color: color,
                      border: `1px solid ${color}35`,
                    }}>
                      {entity.entity_type}
                    </span>

                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Entity Inspector Panel */}
        {selectedEntity && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: `${entityTypeColor(selectedEntity.entity_type)}20`,
                  color: entityTypeColor(selectedEntity.entity_type),
                  border: `1px solid ${entityTypeColor(selectedEntity.entity_type)}40`,
                }}>
                  {selectedEntity.entity_type}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entity Dossier</span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-highlight)', marginBottom: '8px' }}>
                {selectedEntity.name}
              </h3>

              <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                {selectedEntity.description || 'No direct summary provided.'}
              </p>
            </div>

            {/* Evidenced Relationships */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Traceable Connections ({selectedEntityRelations.length})
              </div>

              {selectedEntityRelations.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No direct relations recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEntityRelations.map((rel, idx) => {
                    const isTarget = rel.target_entity === selectedEntity.id || rel.target_entity_name === selectedEntity.name;
                    const counterpartName = isTarget ? rel.source_entity_name : rel.target_entity_name;
                    const citation = rel.evidence_citation_key;
                    const srcObj = citation ? sourcesMap.get(citation) : null;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            color: '#ff6b6b',
                            background: 'var(--red-subtle)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                          }}>
                            {rel.relation_type.replace(/_/g, ' ')}
                          </span>

                          <span style={{ color: 'var(--text-highlight)', fontWeight: 500 }}>
                            {counterpartName}
                          </span>
                        </div>

                        {rel.description && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px' }}>
                            {rel.description}
                          </div>
                        )}

                        {citation && (
                          <button
                            onClick={() => srcObj && onOpenSourceModal(srcObj)}
                            className="citation-badge"
                            style={{ fontSize: '10px' }}
                          >
                            Source [{citation}]
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Entity Sources */}
            {selectedEntity.source_citation_keys && selectedEntity.source_citation_keys.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Mentioned In Sources
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedEntity.source_citation_keys.map((key) => {
                    const src = sourcesMap.get(key);
                    return (
                      <button
                        key={key}
                        onClick={() => src && onOpenSourceModal(src)}
                        className="citation-badge"
                      >
                        [{key}] {src ? src.source_name : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
