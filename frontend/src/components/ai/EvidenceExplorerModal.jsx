import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Filter,
  CheckCircle2,
  Building,
  Radio
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const CATEGORY_LABELS = {
  travel_advisories: 'Official Advisories',
  transport_disruptions: 'Transport & Transit',
  weather_concerns: 'Weather & Climate',
  local_scams: 'Scams & Street Risks',
  emergency_facilities: 'Emergency Grid',
  other_considerations: 'Overlooked Context',
};

export const EvidenceExplorerModal = ({
  isOpen,
  onClose,
  evidenceCatalog = [],
  initialSourceId = null,
  destination = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [focusedId, setFocusedId] = useState(initialSourceId);

  useEffect(() => {
    if (initialSourceId) {
      setFocusedId(initialSourceId);
      // Auto-scroll to item if already mounted
      setTimeout(() => {
        const el = document.getElementById(`evidence-item-${initialSourceId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [initialSourceId, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleCopyCitation = (item) => {
    const citation = `[Source ID: ${item.id}] ${item.title} — ${item.sourceName || 'Verified Ingestion'} (${item.sourceUrl})`;
    navigator.clipboard.writeText(citation);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvidence = useMemo(() => {
    return evidenceCatalog.filter((item) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesSnippet = item.snippet?.toLowerCase().includes(q);
        const matchesUrl = item.sourceUrl?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSnippet && !matchesUrl && !matchesId) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Source type filter
      if (sourceTypeFilter !== 'all' && item.sourceType !== sourceTypeFilter) {
        return false;
      }

      // Currency filter
      if (currencyFilter === 'current' && (item.isOutdated || item.isUndated)) {
        return false;
      }
      if (currencyFilter === 'outdated' && !item.isOutdated) {
        return false;
      }
      if (currencyFilter === 'undated' && !item.isUndated) {
        return false;
      }

      return true;
    });
  }, [evidenceCatalog, searchQuery, categoryFilter, sourceTypeFilter, currencyFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-navy-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-navy-800 bg-navy-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Evidence Explorer
                </h2>
                <Badge variant="cyan" className="font-mono text-[10px]">
                  {evidenceCatalog.length} Total Sources
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Ground-truth provenance verification ledger for{' '}
                <span className="text-cyan-300 font-medium">
                  {destination || 'Destination'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title="Close Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-navy-900/90 border-b border-navy-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified snippet text, title, source ID or URL..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                <option key={catKey} value={catKey}>
                  {label}
                </option>
              ))}
            </select>

            {/* Source Type Dropdown */}
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Provenance Types</option>
              <option value="official">Official (Gov / Diplomatic / Municipal)</option>
              <option value="media">Media / News Outlets</option>
              <option value="unverified">Community / Unverified Claims</option>
            </select>

            {/* Currency Filter */}
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-navy-950 border border-navy-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Currency Statuses</option>
              <option value="current">Current (&lt;180 Days)</option>
              <option value="outdated">Outdated (&gt;180 Days)</option>
              <option value="undated">Undated Telemetry</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              Showing <strong className="text-cyan-400">{filteredEvidence.length}</strong> of{' '}
              {evidenceCatalog.length} evidence records
            </span>
            {focusedId && (
              <span className="text-cyan-300">
                Focused on Source ID:{' '}
                <strong className="underline cursor-pointer" onClick={() => setFocusedId(null)}>
                  {focusedId} (Click to clear focus)
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Evidence List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredEvidence.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Matching Evidence Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No verified source records matched your search query or filter criteria. Clear filters to see all ingested evidence.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setSourceTypeFilter('all');
                  setCurrencyFilter('all');
                  setFocusedId(null);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            filteredEvidence.map((item) => {
              const isFocused = focusedId === item.id;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  id={`evidence-item-${item.id}`}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isFocused
                      ? 'bg-navy-950 border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  {/* Top Bar of item */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 bg-navy-800/80 px-2 py-0.5 rounded border border-navy-700">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>

                      {/* Source Type Badge */}
                      <Badge
                        variant={
                          item.sourceType === 'official'
                            ? 'success'
                            : item.sourceType === 'media'
                            ? 'info'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {item.sourceType === 'official'
                          ? 'Official Ingestion'
                          : item.sourceType === 'media'
                          ? 'Media Report'
                          : 'Unverified Claim'}
                      </Badge>

                      {/* Currency Badge */}
                      {item.isOutdated ? (
                        <Badge variant="warning" className="text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Outdated (&gt;180 Days)
                        </Badge>
                      ) : item.isUndated ? (
                        <Badge variant="default" className="text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Undated
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyCitation(item)}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                        title="Copy citation reference"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Cite</span>
                          </>
                        )}
                      </button>

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors"
                          title="Open original verified source link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit Source</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-semibold text-white leading-snug">
                    {item.title}
                  </h4>

                  {/* Snippet / Content Ground Truth */}
                  <div className="p-3 rounded-lg bg-navy-900/90 border border-navy-800 text-xs text-slate-300 leading-relaxed font-mono">
                    <span className="text-slate-500 select-none">“</span>
                    {item.snippet}
                    <span className="text-slate-500 select-none">”</span>
                  </div>

                  {/* Metadata Footer */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-1 border-t border-navy-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Provider:</span>
                      <strong className="text-slate-300">{item.sourceName || 'Municipal / Web Registry'}</strong>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.publishedDate && (
                        <span>
                          Published: <strong className="text-slate-300">{item.publishedDate}</strong>
                        </span>
                      )}
                      <span>
                        Retrieved: <span className="font-mono text-slate-400">{new Date(item.retrievedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-navy-950 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between px-5">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Anti-hallucination verification active — every finding links directly to a record above.</span>
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done Exploring
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceExplorerModal;
