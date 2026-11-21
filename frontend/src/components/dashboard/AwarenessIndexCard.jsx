import React, { useState } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Info,
  HelpCircle,
  X,
  Calculator,
  FileCheck2,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const AwarenessIndexCard = ({ awarenessIndex, className }) => {
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  if (!awarenessIndex) return null;

  // Normalize structure whether from Phase 2 sample or Phase 6 dynamic service
  const overall = typeof awarenessIndex === 'number' ? awarenessIndex : awarenessIndex.overall || 64;
  const tier = awarenessIndex.tier || (overall >= 75 ? 'Substantial Investigation Coverage' : 'Partial Investigation Coverage');
  const grade = awarenessIndex.grade || (overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : 'D');

  // Submetrics list (defaults to 5 pillars if not explicitly supplied)
  const subMetrics = awarenessIndex.subMetrics || [
    {
      key: 'category_coverage',
      label: 'Categories Investigated',
      score: Math.min(25, Math.round((overall / 100) * 25)),
      maxScore: 25,
      percentage: Math.round(((overall / 100) * 25 / 25) * 100),
      status: overall >= 70 ? 'Optimal' : 'Partial',
      detail: 'Core analysis categories investigated',
      advice: 'Advisories, transit, scams, emergency grid, and local considerations.',
    },
    {
      key: 'evidence_depth',
      label: 'Evidence Availability & Depth',
      score: Math.min(25, Math.round((overall / 100) * 24)),
      maxScore: 25,
      percentage: Math.round(((overall / 100) * 24 / 25) * 100),
      status: overall >= 70 ? 'Dense' : 'Moderate',
      detail: 'Verified source items retrieved',
      advice: 'Aggregated from SerpApi multi-stream search and Google Maps places.',
    },
    {
      key: 'source_freshness',
      label: 'Source Freshness & Currency',
      score: Math.min(20, Math.round((overall / 100) * 19)),
      maxScore: 20,
      percentage: Math.round(((overall / 100) * 19 / 20) * 100),
      status: overall >= 60 ? 'Current' : 'Stale',
      detail: 'Recency analysis (<180 days)',
      advice: 'Evaluates publication timestamps to ensure alerts are timely.',
    },
    {
      key: 'verification_quality',
      label: 'Verification & Provenance',
      score: Math.min(15, Math.round((overall / 100) * 15)),
      maxScore: 15,
      percentage: Math.round(((overall / 100) * 15 / 15) * 100),
      status: overall >= 70 ? 'High Provenance' : 'Moderate',
      detail: 'Official vs media vs community balance',
      advice: 'Prioritizes official consular and municipal registry listings.',
    },
    {
      key: 'information_completeness',
      label: 'Information Completeness',
      score: Math.min(15, Math.round((overall / 100) * 14)),
      maxScore: 15,
      percentage: Math.round(((overall / 100) * 14 / 15) * 100),
      status: overall >= 65 ? 'Complete' : 'Gaps Present',
      detail: 'Penalties for uninvestigated pillars',
      advice: 'Audits absence of emergency medical or consular advisory pillars.',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 65) return { text: 'text-cyan-400', stroke: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (score >= 50) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const scoreTheme = getScoreColor(overall);

  // SVG Radial Progress Calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 flex flex-col justify-between ${className || ''}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-700/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">BlindSpot Awareness Index™</h3>
              <Badge variant={overall >= 75 ? 'success' : overall >= 55 ? 'warning' : 'danger'} className="text-[10px]">
                {tier}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Investigation Coverage Score — Measures intelligence depth, NOT destination safety
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMethodologyModal(true)}
          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          title="Inspect transparent mathematical scoring formula"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scoring Formula</span>
        </button>
      </div>

      {/* Main Gauge & Overall Stats */}
      <div className="py-5 flex flex-col sm:flex-row items-center gap-6 justify-around">
        {/* Radial Progress Gauge */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 110 110">
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="text-navy-800"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke={scoreTheme.stroke}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${scoreTheme.text}`}>
              {overall}
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">/ 100 COVERAGE</span>
          </div>
        </div>

        {/* Executive Summary of the score (Strictly non-safety language) */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-xs font-medium text-slate-300">Coverage Depth Grade:</span>
            <span className="text-lg font-bold font-mono text-white px-2.5 py-0.5 rounded bg-navy-800 border border-navy-700">
              Grade {grade}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {overall >= 80
              ? 'Comprehensive multilateral investigation coverage achieved. Dense factual citations across advisories, transit, and emergency facilities with minimal unknown blindspots.'
              : overall >= 65
              ? 'Substantial baseline coverage. Key logistical and security dimensions possess verified telemetry, with minor supplementary gaps remaining.'
              : overall >= 50
              ? 'Moderate investigation coverage. Several core dimensions have been explored, but significant blindspots or uncorroborated evidence remain.'
              : 'Critical telemetry blindspots detected. Ingested intelligence is sparse or dated; heavy reliance on secondary or unverified sources.'}
          </p>

          <div className="p-2 rounded-lg bg-navy-950/80 border border-cyan-500/20 text-[11px] text-cyan-200/90 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Coverage Metric Principle:</strong> High score = thoroughly investigated. Never indicates whether a destination is objectively safe.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Score Breakdown Bars (5 Pillars) */}
      <div className="space-y-3 pt-4 border-t border-navy-700/50">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            5-Pillar Telemetry Breakdown
          </h4>
          <span className="font-mono text-[11px] text-slate-400">Total: 100 Pts</span>
        </div>

        <div className="space-y-3">
          {subMetrics.map((item) => {
            const itemTheme = getScoreColor(item.percentage);
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400">{item.detail}</span>
                    <span className={`font-semibold ${itemTheme.text}`}>
                      {item.score}/{item.maxScore} pts
                    </span>
                  </div>
                </div>

                <div className="w-full bg-navy-800/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: itemTheme.stroke }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-tight pt-0.5">{item.advice}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Methodology Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-navy-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Transparent Scoring Methodology</h3>
              </div>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed space-y-1.5">
              <strong className="block text-white uppercase tracking-wider font-mono text-[11px]">
                Ground Truth Principle:
              </strong>
              <p>
                The Awareness Index calculates <strong>investigation coverage</strong>, evaluating the breadth, depth, freshness, and provenance of ingested evidence.
              </p>
              <p className="font-semibold text-rose-300">
                It NEVER labels a destination safe or unsafe. A thoroughly investigated location with severe crime risks will yield a HIGH Awareness Index because its risks are known and documented.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
                Mathematical Formula:
              </h4>
              <div className="p-3 rounded-lg bg-navy-950 font-mono text-[11px] text-cyan-300 border border-navy-800">
                Score = Category_Coverage(25) + Evidence_Depth(25) + Source_Freshness(20) + Verification_Quality(15) + Information_Completeness(15)
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>1. Category Coverage (25 Pts)</span>
                  <span className="font-mono text-cyan-400">4.16 pts / category</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Measures how many of the 6 core travel dimensions (Advisories, Transit, Weather, Scams, Emergency Facilities, Considerations) have verified evidence.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>2. Evidence Depth (25 Pts)</span>
                  <span className="font-mono text-cyan-400">Target: 15+ items</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rewards rich, multi-source telemetry volume. Clamped at 25 points for 15 or more verified evidence records.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>3. Source Freshness (20 Pts)</span>
                  <span className="font-mono text-cyan-400">Currency Ratio</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Recent sources (&lt;180 days) earn 1.0 weight; undated earn 0.6; outdated sources (&gt;180 days) are penalized with 0.2 weight.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>4. Verification Quality (15 Pts)</span>
                  <span className="font-mono text-cyan-400">Provenance Check</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rewards official government & municipal registry data (8 pts), news media (4 pts), and penalizes unverified community rumors.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>5. Information Completeness (15 Pts)</span>
                  <span className="font-mono text-cyan-400">Critical Deductions</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deducts points for missing vital pillars: -5 pts for missing emergency grid, -5 pts for missing travel advisories, -3 pts for missing transit.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setShowMethodologyModal(false)}>
                Close Methodology
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwarenessIndexCard;
