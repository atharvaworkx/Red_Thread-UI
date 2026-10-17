import React, { useState } from 'react';
import { X, Search, Sparkles, ArrowRight, AlertCircle, FileText } from 'lucide-react';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string, title?: string) => Promise<void>;
  loading: boolean;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a research question or topic to investigate.");
      return;
    }
    if (question.trim().length < 5) {
      setError("Research question must be at least 5 characters long.");
      return;
    }

    setError(null);
    try {
      await onSubmit(question.trim(), title.trim() || undefined);
      setQuestion('');
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to initialize investigation.");
    }
  };

  const sampleQuestions = [
    "Investigate TSMC CoWoS packaging bottlenecks and 2025 expansion plans",
    "Track High-Bandwidth Memory (HBM3e) qualifications between SK Hynix and Samsung",
    "Major technological developments in open-source AI reasoning models",
    "What are the supply chain dependencies for next-gen AI accelerators?",
  ];

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
        maxWidth: '620px',
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
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--red-primary)',
              boxShadow: '0 0 8px var(--red-glow)',
            }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Initialize Research Investigation
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Research Question Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '6px',
            }}>
              Research Question or Investigation Topic *
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Investigate the supply chain dependencies and production capacity gating AI accelerators in 2025..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                color: 'var(--text-highlight)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Optional Title Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-dim)',
              marginBottom: '6px',
            }}>
              Custom Investigation Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to automatically generate from question"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: 'var(--text-highlight)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Starter Suggestions */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Suggested research templates:
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuestion(sq)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
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
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-dim)',
                fontSize: '13px',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                background: question.trim() ? 'var(--red-primary)' : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                border: question.trim() ? '1px solid #ff5252' : '1px solid var(--border-medium)',
                cursor: question.trim() ? 'pointer' : 'not-allowed',
                boxShadow: question.trim() ? '0 0 14px rgba(229, 57, 53, 0.4)' : 'none',
              }}
            >
              <span>{loading ? 'Executing Pipeline...' : 'Start Investigation'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
