import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Globe,
  FileText
} from 'lucide-react';
import Badge from '../common/Badge';

export const ExpandableEvidenceCard = ({ evidence, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isCopied, setIsCopied] = useState(false);

  if (!evidence) return null;

  const handleCopyCitation = (e) => {
    e.stopPropagation();
    const citation = `[Evidence Ref: ${evidence.id}] ${evidence.title} — ${evidence.sourceName || 'Municipal / Web Registry'} (${evidence.sourceUrl || 'URL unlisted'}). Retrieved: ${new Date(evidence.retrievedAt || Date.now()).toLocaleDateString()}`;
    navigator.clipboard.writeText(citation);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border transition-all text-xs overflow-hidden ${
        isExpanded
          ? 'bg-navy-950 border-cyan-500/40 shadow-lg'
          : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
      }`}
    >
      {/* Header Bar - Always visible, clickable to toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-navy-900/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
            {evidence.id}
          </span>

          <span className="font-medium text-slate-300 line-clamp-1 flex-1 sm:flex-none">
            {evidence.title}
          </span>

          {/* Source Type Badge */}
          <Badge
            variant={
              evidence.sourceType === 'official'
                ? 'success'
                : evidence.sourceType === 'media'
                ? 'info'
                : 'warning'
            }
            className="text-[10px]"
          >
            {evidence.sourceType === 'official'
              ? 'Official'
              : evidence.sourceType === 'media'
              ? 'Media'
              : 'Unverified'}
          </Badge>

          {/* Currency Badge */}
          {evidence.isOutdated ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
              Outdated (&gt;180d)
            </span>
          ) : evidence.isUndated ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Undated
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Current
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            {evidence.sourceName || 'Web Registry'}
          </span>
          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse evidence' : 'Expand evidence details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details Pane */}
      {isExpanded && (
        <div className="p-4 pt-1 border-t border-navy-800/80 bg-navy-950/90 space-y-3 animate-in fade-in duration-150">
          {/* Ground-Truth Quoted Snippet */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Ingested Content Snippet (Ground Truth)
            </span>
            <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 text-xs text-slate-200 leading-relaxed font-mono">
              <span className="text-cyan-500 select-none mr-1">“</span>
              {evidence.snippet || evidence.title}
              <span className="text-cyan-500 select-none ml-1">”</span>
            </div>
          </div>

          {/* Telemetry & Provenance Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-400">
            <div className="p-2 rounded bg-navy-900/60 border border-navy-800">
              <span className="text-slate-500 block text-[10px]">Source Provider:</span>
              <strong className="text-slate-300">{evidence.sourceName || 'Google Search / Maps'}</strong>
            </div>

            <div className="p-2 rounded bg-navy-900/60 border border-navy-800">
              <span className="text-slate-500 block text-[10px]">Category Dimension:</span>
              <strong className="text-cyan-300">{evidence.categoryDisplayName || evidence.category}</strong>
            </div>

            <div className="p-2 rounded bg-navy-900/60 border border-navy-800">
              <span className="text-slate-500 block text-[10px]">Publication Date:</span>
              <strong className="text-slate-300">{evidence.publishedDate || 'Undated Telemetry'}</strong>
            </div>

            <div className="p-2 rounded bg-navy-900/60 border border-navy-800">
              <span className="text-slate-500 block text-[10px]">Ingestion Timestamp:</span>
              <strong className="text-slate-300">
                {evidence.retrievedAt ? new Date(evidence.retrievedAt).toLocaleDateString() : 'Active Session'}
              </strong>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-800">
            <button
              onClick={handleCopyCitation}
              className="px-2.5 py-1 rounded bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Citation Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Academic Citation</span>
                </>
              )}
            </button>

            {evidence.sourceUrl && (
              <a
                href={evidence.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 text-xs font-mono transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Verified Source URL</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandableEvidenceCard;
