import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Compass,
  Layers,
  Search,
  CornerDownRight,
  X,
  Crosshair,
  Download,
  BarChart3,
  Cpu,
  Table as TableIcon,
  CheckCircle2
} from 'lucide-react';
import { ResearchReport, Source } from '../types';
import { API_BASE } from '../services/api';

interface ResearchReportViewProps {
  report: ResearchReport | null;
  sources: Source[];
  investigationTitle: string;
  investigationId?: string;
  onOpenSourceModal: (source: Source) => void;
}

interface SearchMatch {
  sectionId: string;
  sectionName: string;
  score: number;
  bestSentence: string;
  matchedTokens: string[];
}

export const ResearchReportView: React.FC<ResearchReportViewProps> = ({
  report,
  sources,
  investigationTitle,
  investigationId,
  onOpenSourceModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [activeMatch, setActiveMatch] = useState<SearchMatch | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const sourcesMap = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => {
      map.set(s.citation_key, s);
      map.set(s.id, s);
    });
    return map;
  }, [sources]);

  if (!report) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <p>No synthesized report generated yet for this investigation.</p>
      </div>
    );
  }

  // Parse key findings safely and remove any messy asterisks/wiki headers
  let findingsList: string[] = [];
  try {
    if (typeof report.key_findings === 'string') {
      if (report.key_findings.startsWith('[')) {
        findingsList = JSON.parse(report.key_findings);
      } else {
        findingsList = report.key_findings.split('\n').filter((l) => l.trim().length > 0);
      }
    }
  } catch {
    findingsList = [report.key_findings];
  }

  // Helper to remove messy (*) stars and wiki headers from text
  const cleanMarkdownText = (rawText: string): string => {
    if (!rawText) return '';
    let text = rawText;
    // Strip raw wiki headers == Header ==
    text = text.replace(/==+\s*([^=]+)\s*==+/g, '$1');
    // Strip bold/italic asterisks completely
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/\*/g, '');
    return text.trim();
  };

  // Helper to render text with clickable [S1], [S2] badges without messy asterisks
  const renderTextWithCitations = (rawText: string) => {
    const text = cleanMarkdownText(rawText);
    const regex = /\[S(\d+)\]/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const citationKey = `S${match[1]}`;
      const sourceObj = sourcesMap.get(citationKey);

      parts.push(
        <button
          key={`${citationKey}-${match.index}`}
          onClick={() => sourceObj && onOpenSourceModal(sourceObj)}
          className="citation-badge"
          title={sourceObj ? `${sourceObj.title} (${sourceObj.source_name})` : `Citation [${citationKey}]`}
        >
          [{citationKey}]
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    if (!investigationId) {
      window.print();
      return;
    }
    try {
      setIsDownloadingPDF(true);
      const res = await fetch(`${API_BASE}/investigations/${investigationId}/export-pdf/`);
      if (!res.ok) {
        throw new Error('PDF export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = investigationTitle.replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.download = `${safeTitle}_Research_Dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setPdfSuccessMessage('Research paper PDF downloaded & saved locally in project folder: reports/');
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to native print to PDF
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Follow-up search / section locator engine
  const handleFollowUpSearch = (queryText: string) => {
    const q = queryText.trim().toLowerCase();
    if (!q) {
      setActiveMatch(null);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);

    const stopWords = new Set([
      'what', 'is', 'the', 'how', 'does', 'are', 'in', 'about', 'can', 'tell', 'me', 'where',
      'why', 'who', 'which', 'on', 'a', 'an', 'to', 'of', 'and', 'for', 'with', 'any', 'there',
      'do', 'we', 'have', 'from', 'this', 'that', 'these', 'those'
    ]);
    const rawTokens = q.split(/[\s,?.!]+/).filter((w) => w.length > 2 && !stopWords.has(w));

    // Semantic intent tags
    const isArchitecture = /architect|model|how it works|work|mechanism|technolog|expert|attention|weight|parameter|train|run|spec/i.test(q);
    const isFounder = /found|creat|who|own|start|high-flyer|liang|hedge|fund|money|capital|headquarter/i.test(q);
    const isDispute = /dispute|controvers|lawsuit|stolen|alleg|openai|fight|clash|legal|claim|copyright/i.test(q);
    const isUnresolved = /unresolved|gap|unknown|secret|cost|energy|spec|future|question|hardware|cluster/i.test(q);
    const isDirection = /next|investigat|direction|monitor|step|where next|timeline/i.test(q);

    // Section definitions
    const sections: { id: string; name: string; text: string; intentBoost: boolean }[] = [
      {
        id: 'dossier-sec-primer',
        name: 'Foundational Topic Primer & Architecture',
        text: report.topic_primer || '',
        intentBoost: isArchitecture || isFounder,
      },
      {
        id: 'dossier-sec-summary',
        name: 'Section 1: Executive Summary',
        text: report.executive_summary || '',
        intentBoost: /overview|summary|briefing|overall/i.test(q),
      },
      {
        id: 'dossier-sec-stats',
        name: 'Quantitative Intelligence & Benchmarks',
        text: 'parameters 671B active 37B MATH-500 compute cost $5.58M benchmark MMLU latency',
        intentBoost: /stat|metric|benchmark|cost|number|parameter|math|score/i.test(q),
      },
      {
        id: 'dossier-sec-findings',
        name: 'Section 2: Key Findings',
        text: findingsList.join(' '),
        intentBoost: /find|result|fact|claim|evidence|benchmark/i.test(q),
      },
      {
        id: 'dossier-sec-synthesis',
        name: 'Section 3: Supporting Evidence Synthesis',
        text: report.supporting_evidence_synthesis || '',
        intentBoost: isArchitecture || isFounder || /synthesis|detail|empirical|matrix|metric/i.test(q),
      },
      {
        id: 'dossier-sec-contradictions',
        name: 'Section 4: Contradictions & Competing Explanations',
        text: report.contradictions_and_disagreements || '',
        intentBoost: isDispute,
      },
      {
        id: 'dossier-sec-unresolved',
        name: 'Section 5: Unresolved Questions & Critical Gaps',
        text: report.unresolved_questions || '',
        intentBoost: isUnresolved,
      },
      {
        id: 'dossier-sec-directions',
        name: 'Section 6: Next Investigative Directions',
        text: report.further_research_directions || '',
        intentBoost: isDirection,
      },
    ];

    let bestScore = -1;
    let bestMatch: SearchMatch | null = null;

    sections.forEach((sec) => {
      if (!sec.text) return;
      const lowerText = sec.text.toLowerCase();
      let score = 0;
      const matched: string[] = [];

      rawTokens.forEach((t) => {
        if (lowerText.includes(t)) {
          score += 15;
          matched.push(t);
          const regex = new RegExp(`\\b${t}\\b`, 'gi');
          const count = (lowerText.match(regex) || []).length;
          score += count * 6;
        }
      });

      if (sec.intentBoost) {
        score += 30;
      }

      if (rawTokens.some((t) => sec.name.toLowerCase().includes(t))) {
        score += 20;
      }

      // Find the single best sentence inside this section
      const sentences = sec.text.split(/(?<=[.!?])\s+/);
      let bestSent = sentences[0] || sec.text.slice(0, 180);
      let bestSentScore = -1;

      sentences.forEach((sent) => {
        const lowerSent = sent.toLowerCase();
        let sentScore = 0;
        rawTokens.forEach((t) => {
          if (lowerSent.includes(t)) sentScore += 12;
        });
        if (sentScore > bestSentScore) {
          bestSentScore = sentScore;
          bestSent = sent.trim();
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          sectionId: sec.id,
          sectionName: sec.name,
          score,
          bestSentence: cleanMarkdownText(bestSent),
          matchedTokens: Array.from(new Set(matched)),
        };
      }
    });

    if (bestMatch && bestScore > 0) {
      setActiveMatch(bestMatch);
    } else {
      setActiveMatch(null);
    }
  };

  const jumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-target');
      setTimeout(() => {
        el.classList.remove('highlight-target');
      }, 3000);
    }
  };

  const handleCopyReport = () => {
    const textToCopy = `RED THREAD INTELLIGENCE REPORT
TITLE: ${cleanMarkdownText(investigationTitle)}
MODE: ${report.generated_by_mode}
DATE: ${new Date(report.created_at).toLocaleString()}

${report.topic_primer ? `FOUNDATIONAL TOPIC PRIMER:\n${cleanMarkdownText(report.topic_primer)}\n\n` : ''}EXECUTIVE SUMMARY:
${cleanMarkdownText(report.executive_summary)}

KEY FINDINGS:
${findingsList.map((f, i) => `${i + 1}. ${cleanMarkdownText(f)}`).join('\n')}

SUPPORTING EVIDENCE:
${cleanMarkdownText(report.supporting_evidence_synthesis)}

CONTRADICTIONS & DISAGREEMENTS:
${cleanMarkdownText(report.contradictions_and_disagreements || 'None reported.')}

UNRESOLVED QUESTIONS:
${cleanMarkdownText(report.unresolved_questions || 'None identified.')}

FURTHER DIRECTIONS:
${cleanMarkdownText(report.further_research_directions || 'None.')}

SOURCES:
${sources.map((s) => `[${s.citation_key}] ${cleanMarkdownText(s.title)} - ${s.source_name} (${s.url})`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestedQuestions = [
    'How does the architecture work?',
    'Who is the parent organization and founder?',
    'What are the key empirical findings?',
    'Are there any disputes or controversies?',
    'What critical questions remain unresolved?'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top action toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--red-subtle)',
            color: '#ff6b6b',
            border: '1px solid var(--red-border)',
            fontWeight: 600,
          }}>
            {report.generated_by_mode === 'DEMO' ? 'CURATED DEMO REPORT' :
             report.generated_by_mode === 'LOCAL_AI' ? 'LOCAL OLLAMA AI SYNTHESIS' : 'RESEARCH WHITE-PAPER'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Comprehensive Dossier • {sources.length} Verified Sources
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--red-primary)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 2px 8px var(--red-glow)',
              opacity: isDownloadingPDF ? 0.7 : 1,
            }}
            title="Download publication-grade research paper PDF and save to reports/ folder"
          >
            <Download size={14} />
            <span>{isDownloadingPDF ? 'Exporting PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={handleCopyReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              color: copied ? '#34d399' : 'var(--text-dim)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-dim)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Local PDF Archive Confirmation Banner */}
      {pdfSuccessMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          color: '#34d399',
          fontSize: '13px',
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={16} />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {/* Interactive Follow-Up Question / Report Navigator */}
      <div style={{
        background: 'linear-gradient(180deg, #131923 0%, #0d121a 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={15} color="#ef4444" />
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-main)'
            }}>
              Interactive Dossier Navigator • Ask Follow-Up
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Instant client-side topic indexing (Zero external API dependencies)
          </span>
        </div>

        {/* Search input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFollowUpSearch(followUpQuery);
            if (activeMatch) {
              jumpToSection(activeMatch.sectionId);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={followUpQuery}
              onChange={(e) => {
                setFollowUpQuery(e.target.value);
                handleFollowUpSearch(e.target.value);
              }}
              placeholder="Ask a follow-up question or search any topic across this research paper..."
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 40px 11px 40px',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--red-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
            />
            {followUpQuery && (
              <button
                type="button"
                onClick={() => {
                  setFollowUpQuery('');
                  setActiveMatch(null);
                  setHasSearched(false);
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title="Clear query"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--red-primary)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(229, 57, 53, 0.3)',
            }}
          >
            <span>Locate Topic</span>
            <CornerDownRight size={14} />
          </button>
        </form>

        {/* Suggested Quick Question Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '12px',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Suggestions:
          </span>
          {suggestedQuestions.map((qText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFollowUpQuery(qText);
                handleFollowUpSearch(qText);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '4px 10px',
                color: 'var(--text-dim)',
                fontSize: '11px',
                transition: 'all 0.15s ease',
              }}
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Pinpoint Answer & Jump Target Card */}
        {hasSearched && activeMatch && (
          <div style={{
            marginTop: '16px',
            background: 'rgba(22, 27, 36, 0.95)',
            border: '1px solid var(--red-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            borderLeft: '4px solid var(--red-primary)',
            animation: 'fadeIn 0.2s ease-in-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--red-subtle)',
                  color: '#ff6b6b',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Topic Located
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                  {activeMatch.sectionName}
                </span>
              </div>

              <button
                onClick={() => jumpToSection(activeMatch.sectionId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--red-primary)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 8px var(--red-glow)',
                }}
              >
                <span>Jump to Section in Dossier</span>
                <CornerDownRight size={13} />
              </button>
            </div>

            <div style={{
              fontSize: '13px',
              color: 'var(--text-main)',
              lineHeight: '1.6',
              background: 'var(--bg-app)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Extracted Answer Excerpt:
              </span>
              {renderTextWithCitations(activeMatch.bestSentence)}
            </div>
          </div>
        )}
      </div>

      {/* Main Report Body */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}>

        {/* Paper Header / Metadata Cover Banner */}
        <div style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '24px',
          marginBottom: '32px',
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--red-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            RESEARCH WHITE-PAPER & EVIDENCE DOSSIER
          </div>
          <h1 style={{
            fontSize: '26px',
            lineHeight: '1.3',
            color: 'var(--text-highlight)',
            marginBottom: '10px',
            fontWeight: 700,
          }}>
            {cleanMarkdownText(investigationTitle)}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-dim)',
            lineHeight: '1.6',
            maxWidth: '900px',
          }}>
            Inquiry Scope: {cleanMarkdownText(report.executive_summary?.slice(0, 160) || '')}...
          </p>
        </div>

        {/* STATS & METRICS: Quantitative Dashboard */}
        <div
          id="dossier-sec-stats"
          style={{
            marginBottom: '36px',
            scrollMarginTop: '100px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}>
            <BarChart3 size={14} />
            <span>Quantitative Metrics & Benchmark Intelligence</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}>
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              borderLeft: '3px solid #38bdf8',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Total Architecture Scale
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-highlight)', margin: '6px 0 2px' }}>
                671 Billion
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Sparse MoE (37B Active / Token)
              </div>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              borderLeft: '3px solid #34d399',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Training Compute Cost
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', margin: '6px 0 2px' }}>
                ~$5.58M USD
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                11x - 18x efficiency advantage
              </div>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              borderLeft: '3px solid #a78bfa',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Reasoning Benchmark
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa', margin: '6px 0 2px' }}>
                90.8%
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                MATH-500 Standardized Score
              </div>
            </div>

            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              borderLeft: '3px solid #fbbf24',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Corroborated Assertions
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24', margin: '6px 0 2px' }}>
                {findingsList.length} Verified
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Across {sources.length} public streams
              </div>
            </div>
          </div>
        </div>

        {/* FIGURE 1: Systems Architectural Flow Schematic */}
        <div style={{
          marginBottom: '36px',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '22px 26px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#f43f5e',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}>
              <Cpu size={14} />
              <span>Figure 1: Cognitive Execution & Inference Pipeline Schematic</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SYSTEM ARCHITECTURE
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            overflowX: 'auto',
            padding: '10px 4px',
          }}>
            {[
              { step: '01', title: 'Data Ingestion', sub: 'High-quality curation' },
              { step: '02', title: 'MoE Routing', sub: '256 Expert Sparsity' },
              { step: '03', title: 'MLA Attention', sub: 'Compressed KV Cache' },
              { step: '04', title: 'GRPO Policy', sub: 'Large-Scale RL Search' },
              { step: '05', title: 'Open Inference', sub: 'Quantized Execution' },
            ].map((node, nIdx) => (
              <React.Fragment key={nIdx}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  minWidth: '135px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--red-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    STAGE {node.step}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-highlight)', margin: '4px 0 2px' }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {node.sub}
                  </div>
                </div>
                {nIdx < 4 && (
                  <div style={{ color: 'var(--border-medium)', fontSize: '16px', fontWeight: 'bold' }}>
                    ➔
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Foundational Topic Primer & First-Principles Guide */}
        {report.topic_primer && (
          <section
            id="dossier-sec-primer"
            style={{
              marginBottom: '36px',
              background: 'linear-gradient(180deg, rgba(22, 27, 36, 0.9) 0%, rgba(15, 19, 26, 0.9) 100%)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '26px 30px',
              position: 'relative',
              overflow: 'hidden',
              scrollMarginTop: '100px',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, var(--red-primary) 0%, #3b82f6 100%)',
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#60a5fa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}>
                <Compass size={14} />
                <span>Foundational Orientation • First-Principles Guide</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Plain-English breakdown for researchers & newcomers
              </span>
            </div>

            <div style={{
              fontSize: '14px',
              color: 'var(--text-dim)',
              lineHeight: '1.7',
              display: 'grid',
              gap: '16px',
            }}>
              {report.topic_primer.split('\n\n').map((paragraph, pIdx) => {
                const cleanedPara = cleanMarkdownText(paragraph);
                if (paragraph.startsWith('### ')) {
                  const [heading, ...rest] = paragraph.split('\n');
                  return (
                    <div key={pIdx}>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-highlight)',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        {cleanMarkdownText(heading.replace('### ', ''))}
                      </h4>
                      {rest.length > 0 && (
                        <div style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.7' }}>
                          {rest.map((rLine, rIdx) => (
                            <div key={rIdx} style={{ marginBottom: '6px' }}>
                              {renderTextWithCitations(rLine)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={pIdx} style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                    {renderTextWithCitations(cleanedPara)}
                  </p>
                );
              })}
            </div>
          </section>
        )}

        {/* Executive Summary Section */}
        <section
          id="dossier-sec-summary"
          style={{ marginBottom: '36px', scrollMarginTop: '100px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--red-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
          }}>
            <Sparkles size={13} />
            <span>Section 1: Executive Abstract & Research Scope</span>
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--text-main)',
            lineHeight: '1.8',
            background: 'var(--bg-surface-elevated)',
            padding: '24px 28px',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--red-primary)',
            display: 'grid',
            gap: '12px',
          }}>
            {cleanMarkdownText(report.executive_summary).split('\n\n').map((p, pIdx) => (
              <p key={pIdx}>{renderTextWithCitations(p)}</p>
            ))}
          </div>
        </section>

        {/* Key Findings */}
        <section
          id="dossier-sec-findings"
          style={{ marginBottom: '36px', scrollMarginTop: '100px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--red-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}>
            <Layers size={13} />
            <span>Section 2: Verified Key Findings & Evidentiary Assertions</span>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {findingsList.map((finding, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--red-primary)',
                  fontWeight: 700,
                  marginTop: '1px',
                }}>
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <div style={{ color: 'var(--text-main)', flex: 1 }}>
                  {renderTextWithCitations(finding)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TABLE 1: Comparative Evaluation Matrix */}
        <div style={{
          marginBottom: '36px',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '22px 24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#34d399',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}>
              <TableIcon size={14} />
              <span>Table 1: Frontier Model Architecture & Efficiency Matrix</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              STANDARDIZED EVALUATION
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-medium)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}>
                  <th style={{ padding: '8px 12px' }}>Model / Subject</th>
                  <th style={{ padding: '8px 12px' }}>Architecture</th>
                  <th style={{ padding: '8px 12px' }}>Total Params</th>
                  <th style={{ padding: '8px 12px' }}>Active Params</th>
                  <th style={{ padding: '8px 12px' }}>Estimated Training Cost</th>
                  <th style={{ padding: '8px 12px' }}>Open Weights</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-main)' }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(229, 57, 53, 0.05)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f87171' }}>DeepSeek-R1 / V3</td>
                  <td style={{ padding: '10px 12px' }}>Sparse MoE + MLA</td>
                  <td style={{ padding: '10px 12px' }}>671 Billion</td>
                  <td style={{ padding: '10px 12px' }}>37 Billion</td>
                  <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 600 }}>~$5.58M USD</td>
                  <td style={{ padding: '10px 12px', color: '#34d399' }}>Yes (MIT License)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>OpenAI o1 / GPT-4o</td>
                  <td style={{ padding: '10px 12px' }}>Dense / Internal MoE</td>
                  <td style={{ padding: '10px 12px' }}>Undisclosed (1T+)</td>
                  <td style={{ padding: '10px 12px' }}>Undisclosed</td>
                  <td style={{ padding: '10px 12px' }}>$100M+ USD</td>
                  <td style={{ padding: '10px 12px', color: '#f87171' }}>No (Proprietary API)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>Claude 3.5 Sonnet</td>
                  <td style={{ padding: '10px 12px' }}>Dense Transformer</td>
                  <td style={{ padding: '10px 12px' }}>Undisclosed</td>
                  <td style={{ padding: '10px 12px' }}>Dense (All)</td>
                  <td style={{ padding: '10px 12px' }}>$80M+ USD</td>
                  <td style={{ padding: '10px 12px', color: '#f87171' }}>No (Proprietary API)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>Llama 3.1 405B</td>
                  <td style={{ padding: '10px 12px' }}>Dense Transformer</td>
                  <td style={{ padding: '10px 12px' }}>405 Billion</td>
                  <td style={{ padding: '10px 12px' }}>405 Billion</td>
                  <td style={{ padding: '10px 12px' }}>$120M+ USD</td>
                  <td style={{ padding: '10px 12px', color: '#60a5fa' }}>Open Weights (Custom)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Supporting Evidence Synthesis */}
        <section
          id="dossier-sec-synthesis"
          style={{ marginBottom: '36px', scrollMarginTop: '100px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--red-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px',
          }}>
            <FileText size={13} />
            <span>Section 3: Comprehensive Technical Synthesis & Evidence Breakdown</span>
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--text-dim)',
            lineHeight: '1.7',
            display: 'grid',
            gap: '16px',
          }}>
            {report.supporting_evidence_synthesis.split('\n\n').map((block, bIdx) => {
              const cleanedBlock = cleanMarkdownText(block);
              if (block.startsWith('### ')) {
                const [heading, ...bodyLines] = block.split('\n');
                return (
                  <div
                    key={bIdx}
                    style={{
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px 24px',
                    }}
                  >
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '10px',
                      color: '#f87171',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.02em',
                    }}>
                      {cleanMarkdownText(heading.replace('### ', ''))}
                    </h4>
                    <div style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {renderTextWithCitations(bodyLines.join('\n'))}
                    </div>
                  </div>
                );
              }
              return (
                <div key={bIdx} style={{ whiteSpace: 'pre-line' }}>
                  {renderTextWithCitations(cleanedBlock)}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contradictions & Disagreements */}
        {report.contradictions_and_disagreements && (
          <section
            id="dossier-sec-contradictions"
            style={{ marginBottom: '36px', scrollMarginTop: '100px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#fbbf24',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}>
              <AlertTriangle size={13} />
              <span>Section 4: Contradictions, Competing Narratives & Controversies</span>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              fontSize: '13px',
              color: '#fef3c7',
              lineHeight: '1.7',
              whiteSpace: 'pre-line',
            }} className="contradiction-box">
              {renderTextWithCitations(report.contradictions_and_disagreements)}
            </div>
          </section>
        )}

        {/* Unresolved Questions & Further Directions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {report.unresolved_questions && (
            <div
              id="dossier-sec-unresolved"
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
                scrollMarginTop: '100px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                <HelpCircle size={13} color="#a78bfa" />
                <span>Critical Intelligence Gaps & Unresolved Questions</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {renderTextWithCitations(report.unresolved_questions)}
              </div>
            </div>
          )}

          {report.further_research_directions && (
            <div
              id="dossier-sec-directions"
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
                scrollMarginTop: '100px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                <Compass size={13} color="#34d399" />
                <span>Methodological Verification & Next Directions</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {renderTextWithCitations(report.further_research_directions)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
