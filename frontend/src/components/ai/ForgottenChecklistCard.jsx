import React from 'react';
import {
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  RefreshCw,
  Eye,
  FileQuestion
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const ForgottenChecklistCard = ({
  checklist = [],
  totalEvidenceCount = 0,
  isLoading = false,
  onRefresh,
  onInspectCategory,
  className = '',
}) => {
  // Aggregate stats
  const adequatelyCheckedCount = checklist.filter(
    (c) => c.status === 'adequately_checked'
  ).length;
  const insufficientCount = checklist.filter(
    (c) => c.status === 'insufficient_evidence'
  ).length;
  const uninvestigatedCount = checklist.filter(
    (c) => c.status === 'uninvestigated'
  ).length;

  return (
    <div
      className={`glass-card rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Forgotten Checklist
              </h3>
              <Badge variant="info" className="font-mono text-[10px]">
                6 Core Dimensions
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Identifies under-investigated travel domains & intelligence blind spots
            </p>
          </div>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            loading={isLoading}
            icon={RefreshCw}
            className="self-start sm:self-auto"
          >
            Re-Audit
          </Button>
        )}
      </div>

      {/* Tally Metrics Bar */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-lg font-bold font-mono text-white">{adequatelyCheckedCount}</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium block">
            Adequately Checked
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-lg font-bold font-mono text-white">{insufficientCount}</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium block">
            Limited Telemetry
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-lg font-bold font-mono text-white">{uninvestigatedCount}</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium block">
            Critical BlindSpots
          </span>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {checklist.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <FileQuestion className="w-8 h-8 mx-auto text-slate-500" />
            <p>Run AI intelligence analysis to generate the Forgotten Checklist audit.</p>
          </div>
        ) : (
          checklist.map((item) => {
            const isChecked = item.status === 'adequately_checked';
            const isInsufficient = item.status === 'insufficient_evidence';
            const isUninvestigated = item.status === 'uninvestigated';

            return (
              <div
                key={item.category}
                className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                  isChecked
                    ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40'
                    : isInsufficient
                    ? 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-rose-950/30 border-rose-500/30 hover:border-rose-500/50'
                }`}
              >
                {/* Title and Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isInsufficient ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {item.displayName || item.category}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.evidenceCount} verified {item.evidenceCount === 1 ? 'record' : 'records'}
                    </span>
                    <Badge
                      variant={
                        isChecked ? 'success' : isInsufficient ? 'warning' : 'danger'
                      }
                      className="text-[10px]"
                    >
                      {isChecked
                        ? 'Adequately Checked'
                        : isInsufficient
                        ? 'Limited Evidence'
                        : 'Uninvestigated BlindSpot'}
                    </Badge>
                  </div>
                </div>

                {/* Gap Analysis */}
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {item.gapAnalysis}
                </p>

                {/* Recommended Mitigation / Targeted Action */}
                <div className="ml-6 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-cyan-400 font-semibold flex-shrink-0">Action:</span>
                    <span>{item.recommendedAction}</span>
                  </div>

                  {onInspectCategory && (
                    <button
                      onClick={() => onInspectCategory(item.category)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-800 flex items-center gap-1 flex-shrink-0 transition-colors"
                      title="Inspect category evidence in Explorer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer explanation */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Categories lacking verified telemetry are strictly isolated as unconfirmed.</span>
        </span>
        <span className="font-mono text-slate-500">
          Total Ingested: {totalEvidenceCount}
        </span>
      </div>
    </div>
  );
};

export default ForgottenChecklistCard;
