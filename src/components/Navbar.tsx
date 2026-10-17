import React from 'react';
import { Shield, Cpu, RefreshCw, Plus, Database, Sparkles } from 'lucide-react';
import { SystemHealth } from '../types';

interface NavbarProps {
  currentView: 'command' | 'workspace' | 'history' | 'settings';
  setCurrentView: (view: 'command' | 'workspace' | 'history' | 'settings') => void;
  systemHealth: SystemHealth | null;
  hasActiveWorkspace: boolean;
  onOpenNewModal: () => void;
  onOpenDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  systemHealth,
  hasActiveWorkspace,
  onOpenNewModal,
  onOpenDemo,
}) => {
  const isAiOnline = systemHealth?.ai_provider?.reachable && systemHealth?.ai_provider?.model_installed;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 12, 16, 0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div 
          onClick={() => setCurrentView('command')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #1e0505 0%, #350808 100%)',
            border: '1px solid rgba(229, 57, 53, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(229, 57, 53, 0.25)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 12C8 6 16 18 20 12" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="4" cy="12" r="2.5" fill="#e53935"/>
              <circle cx="20" cy="12" r="2.5" fill="#e53935"/>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--text-highlight)',
              }}>
                RED THREAD
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 5px',
                borderRadius: '3px',
                background: 'rgba(229, 57, 53, 0.15)',
                color: '#ff6b6b',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                border: '1px solid rgba(229, 57, 53, 0.3)'
              }}>
                OSINT INTEL
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Every story leaves a trail.
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentView('command')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              background: currentView === 'command' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: currentView === 'command' ? 'var(--text-highlight)' : 'var(--text-dim)',
              border: currentView === 'command' ? '1px solid var(--border-medium)' : '1px solid transparent',
            }}
          >
            Command Center
          </button>

          {hasActiveWorkspace && (
            <button
              onClick={() => setCurrentView('workspace')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currentView === 'workspace' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: currentView === 'workspace' ? 'var(--text-highlight)' : 'var(--text-dim)',
                border: currentView === 'workspace' ? '1px solid var(--red-border)' : '1px solid transparent',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-primary)' }} />
              Active Workspace
            </button>
          )}

          <button
            onClick={() => setCurrentView('history')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              background: currentView === 'history' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: currentView === 'history' ? 'var(--text-highlight)' : 'var(--text-dim)',
              border: currentView === 'history' ? '1px solid var(--border-medium)' : '1px solid transparent',
            }}
          >
            Investigations
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              background: currentView === 'settings' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: currentView === 'settings' ? 'var(--text-highlight)' : 'var(--text-dim)',
              border: currentView === 'settings' ? '1px solid var(--border-medium)' : '1px solid transparent',
            }}
          >
            System Status
          </button>
        </nav>
      </div>

      {/* Right controls: AI Status, Demo Launcher, New Investigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI & DB Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: systemHealth?.database === 'CONNECTED' ? '#10b981' : '#ef4444',
            }} />
            <span style={{ color: 'var(--text-dim)' }}>DB</span>
          </div>

          <span style={{ color: 'var(--border-medium)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={13} color={isAiOnline ? '#34d399' : '#64748b'} />
            <span style={{ color: isAiOnline ? '#34d399' : 'var(--text-muted)' }}>
              {isAiOnline ? 'OLLAMA AI' : 'RULE-BASED'}
            </span>
          </div>
        </div>

        {/* Explore Demo Button */}
        <button
          onClick={onOpenDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-main)',
            fontSize: '12px',
            fontWeight: 500,
          }}
          title="Open curated semiconductor investigation"
        >
          <Sparkles size={13} color="#ff9800" />
          <span>Curated Demo</span>
        </button>

        {/* New Investigation Button */}
        <button
          onClick={onOpenNewModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--red-primary)',
            border: '1px solid #ff5252',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 0 10px rgba(229, 57, 53, 0.3)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};
