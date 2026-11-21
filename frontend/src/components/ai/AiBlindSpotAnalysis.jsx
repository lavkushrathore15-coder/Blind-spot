import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  FileCheck,
  FileQuestion,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import aiService from '../../services/aiService';
import EvidenceExplorerModal from './EvidenceExplorerModal';

const CLAIM_TYPE_CONFIG = {
  confirmed_fact: {
    label: 'Confirmed Fact',
    variant: 'success',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
    desc: 'Validated by official diplomatic, municipal, or verified registry sources.',
  },
  reported_event: {
    label: 'Reported Event',
    variant: 'info',
    badgeClass: 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300',
    desc: 'Reported by news media outlets; subject to ongoing editorial updates.',
  },
  unverified_claim: {
    label: 'Unverified Claim',
    variant: 'warning',
    badgeClass: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
    desc: 'Community or uncorroborated report; not yet officially substantiated.',
  },
};

const CATEGORY_NAMES = {
  travel_advisories: 'Official Travel Advisory',
  transport_disruptions: 'Transit & Disruption',
  weather_concerns: 'Weather & Climate Risk',
  local_scams: 'Reported Scam & Street Hazard',
  emergency_facilities: 'Emergency Medical & Police Grid',
  other_considerations: 'Overlooked Cultural & Legal Context',
};

export const AiBlindSpotAnalysis = ({
  destinationName = 'Bogotá, Colombia',
  initialFindings = null,
  className = '',
  onChecklistUpdate = null,
}) => {
  const [findings, setFindings] = useState(initialFindings || []);
  const [evidenceCatalog, setEvidenceCatalog] = useState([]);
  const [totalEvidenceIngested, setTotalEvidenceIngested] = useState(0);
  const [rejectedFindings, setRejectedFindings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);

  // Evidence Explorer modal state
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  // Auto-run analysis when destinationName changes or on initial mount if findings are empty
  const runAnalysis = async () => {
    if (!destinationName) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.analyzeDestination(destinationName);
      if (response && response.success && response.data) {
        const data = response.data;
        setFindings(data.findings || []);
        setRejectedFindings(data.rejectedFindings || []);
        setEvidenceCatalog(data.evidenceCatalog || []);
        setTotalEvidenceIngested(data.totalEvidenceIngested || 0);
        setLastAnalyzedAt(data.analysedAt || new Date().toISOString());

        if (onChecklistUpdate && Array.isArray(data.forgottenChecklist)) {
          onChecklistUpdate(data.forgottenChecklist, data.totalEvidenceIngested);
        }
      } else {
        setError('Received invalid response from AI intelligence engine.');
      }
    } catch (err) {
      console.warn('AI analysis execution error:', err);
      setError(err.message || 'Failed to execute AI blindspot analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [destinationName]);

  const handleOpenExplorerWithSource = (sourceId) => {
    setSelectedSourceId(sourceId);
    setIsExplorerOpen(true);
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 border border-slate-200/90 shadow-glass-light flex flex-col ${className}`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-200 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI BlindSpot Discoveries
              </h3>
              <Badge variant="cyan" className="font-mono text-[10px]">
                Zero-Hallucination Grounded
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Multilateral synthesis anchored strictly to verified evidence sources
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedSourceId(null);
              setIsExplorerOpen(true);
            }}
            disabled={evidenceCatalog.length === 0}
            icon={Search}
          >
            Evidence Explorer ({evidenceCatalog.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={runAnalysis}
            loading={isLoading}
            icon={RefreshCw}
          >
            Re-Analyze
          </Button>
        </div>
      </div>

      {/* Safety & Anti-Hallucination Telemetry Bar */}
      <div className="my-3.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            Telemetry Anchor:{' '}
            <strong className="text-white font-bold">
              {totalEvidenceIngested} verified source items ingested
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            100% Citation Grounded
          </span>
          {rejectedFindings.length > 0 && (
            <span className="text-amber-300 font-semibold">
              Rejected Hallucinations: {rejectedFindings.length}
            </span>
          )}
          {lastAnalyzedAt && (
            <span className="text-slate-400 hidden md:inline">
              Audited: {new Date(lastAnalyzedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Findings Content Area */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-white">
              Running AI BlindSpot Grounding Engine...
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Ingesting SerpApi travel feeds, Google Maps emergency registries, and verifying factual citations.
            </p>
          </div>
        ) : findings.length === 0 ? (
          /* Explicit Insufficient Evidence Message */
          <div className="py-12 px-6 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">
              Insufficient Validated Evidence for AI Synthesis
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              In accordance with BlindSpot's strict anti-hallucination protocols, no assumptions or ungrounded claims are generated without verified evidence. Ingest additional search feeds or emergency locations to enable synthesis.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={runAnalysis}
              icon={RefreshCw}
            >
              Trigger Live Ingestion
            </Button>
          </div>
        ) : (
          findings.map((item) => {
            const claimMeta =
              CLAIM_TYPE_CONFIG[item.claimType] || CLAIM_TYPE_CONFIG.unverified_claim;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
              >
                {/* Header row with badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded">
                      {CATEGORY_NAMES[item.category] || item.category}
                    </span>

                    {/* Claim Type Badge */}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${claimMeta.badgeClass}`}
                      title={claimMeta.desc}
                    >
                      {claimMeta.label}
                    </span>

                    {/* Outdated / Undated Evidence Warnings */}
                    {item.isOutdatedEvidence && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Outdated Source (&gt;180d)
                      </span>
                    )}
                    {item.isUndatedEvidence && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 font-semibold">
                        Undated Source
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Confidence:{' '}
                      <span className="text-cyan-300 font-bold">
                        {item.confidenceScore}%
                      </span>
                    </span>

                    <Badge
                      variant={
                        item.severity === 'critical'
                          ? 'danger'
                          : item.severity === 'high'
                          ? 'warning'
                          : item.severity === 'moderate'
                          ? 'info'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {item.severity ? item.severity.toUpperCase() : 'NOTICE'}
                    </Badge>
                  </div>
                </div>

                {/* Finding Title & Grounded Body */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed pl-3.5 border-l-2 border-slate-700">
                    {item.finding}
                  </p>
                </div>

                {/* Actionable Mitigation Box */}
                {item.actionableMitigation && (
                  <div className="p-3 rounded-lg bg-slate-950/90 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cyan-300">
                        Actionable Mitigation:{' '}
                      </span>
                      <span className="text-slate-200">{item.actionableMitigation}</span>
                    </div>
                  </div>
                )}

                {/* Verified Source Citations Pill Row */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">
                      Verified Citations:
                    </span>
                    {Array.isArray(item.sourceIds) && item.sourceIds.length > 0 ? (
                      item.sourceIds.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => handleOpenExplorerWithSource(sid)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                          title={`Click to inspect evidence record ${sid} in Evidence Explorer`}
                        >
                          <span>{sid}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] text-amber-400 italic">
                        No sources linked
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (item.sourceIds && item.sourceIds[0]) {
                        handleOpenExplorerWithSource(item.sourceIds[0]);
                      } else {
                        setSelectedSourceId(null);
                        setIsExplorerOpen(true);
                      }
                    }}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-mono transition-colors font-semibold"
                  >
                    <span>Inspect Provenance</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Evidence Explorer Modal */}
      <EvidenceExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        evidenceCatalog={evidenceCatalog}
        initialSourceId={selectedSourceId}
        destination={destinationName}
      />
    </div>
  );
};

export default AiBlindSpotAnalysis;
