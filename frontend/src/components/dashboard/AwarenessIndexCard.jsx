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
    if (score >= 80) return { text: 'text-emerald-700', stroke: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 65) return { text: 'text-cyan-700', stroke: '#0891b2', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    if (score >= 50) return { text: 'text-amber-700', stroke: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-rose-700', stroke: '#e11d48', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const scoreTheme = getScoreColor(overall);

  // SVG Radial Progress Calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-glass-light ${className || ''}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">BlindSpot Awareness Index™</h3>
              <Badge variant={overall >= 75 ? 'success' : overall >= 55 ? 'warning' : 'danger'} className="text-[10px]">
                {tier}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Investigation Coverage Score — Measures intelligence depth, NOT destination safety
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMethodologyModal(true)}
          className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-cyan-800 hover:text-cyan-900 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs font-semibold"
          title="Inspect transparent mathematical scoring formula"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-700" />
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
              className="text-slate-200"
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
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">/ 100 COVERAGE</span>
          </div>
        </div>

        {/* Executive Summary of the score (Strictly non-safety language) */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-xs font-semibold text-slate-700">Coverage Depth Grade:</span>
            <span className="text-lg font-bold font-mono text-slate-900 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              Grade {grade}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {overall >= 80
              ? 'Comprehensive multilateral investigation coverage achieved. Dense factual citations across advisories, transit, and emergency facilities with minimal unknown blindspots.'
              : overall >= 65
              ? 'Substantial baseline coverage. Key logistical and security dimensions possess verified telemetry, with minor supplementary gaps remaining.'
              : overall >= 50
              ? 'Moderate investigation coverage. Several core dimensions have been explored, but significant blindspots or uncorroborated evidence remain.'
              : 'Critical telemetry blindspots detected. Ingested intelligence is sparse or dated; heavy reliance on secondary or unverified sources.'}
          </p>

          <div className="p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-[11px] text-cyan-900 flex items-start gap-1.5 shadow-xs">
            <Info className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Coverage Metric Principle:</strong> High score = thoroughly investigated. Never indicates whether a destination is objectively safe.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Score Breakdown Bars (5 Pillars) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            5-Pillar Telemetry Breakdown
          </h4>
          <span className="font-mono text-[11px] text-slate-500">Total: 100 Pts</span>
        </div>

        <div className="space-y-3">
          {subMetrics.map((item) => {
            const itemTheme = getScoreColor(item.percentage);
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-500">{item.detail}</span>
                    <span className={`font-semibold ${itemTheme.text}`}>
                      {item.score}/{item.maxScore} pts
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: itemTheme.stroke }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Methodology Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-white/95 border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-700" />
                <h3 className="text-base font-bold text-slate-900">Transparent Scoring Methodology</h3>
              </div>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 leading-relaxed space-y-1.5">
              <strong className="block text-cyan-900 uppercase tracking-wider font-mono text-[11px]">
                Ground Truth Principle:
              </strong>
              <p>
                The Awareness Index calculates <strong>investigation coverage</strong>, evaluating the breadth, depth, freshness, and provenance of ingested evidence.
              </p>
              <p className="font-semibold text-rose-700">
                It NEVER labels a destination safe or unsafe. A thoroughly investigated location with severe crime risks will yield a HIGH Awareness Index because its risks are known and documented.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
                Mathematical Formula:
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-cyan-800 border border-slate-200">
                Score = Category_Coverage(25) + Evidence_Depth(25) + Source_Freshness(20) + Verification_Quality(15) + Information_Completeness(15)
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>1. Category Coverage (25 Pts)</span>
                  <span className="font-mono text-cyan-700">4.16 pts / category</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Measures how many of the 6 core travel dimensions (Advisories, Transit, Weather, Scams, Emergency Facilities, Considerations) have verified evidence.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>2. Evidence Depth (25 Pts)</span>
                  <span className="font-mono text-cyan-700">Target: 15+ items</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Rewards rich, multi-source telemetry volume. Clamped at 25 points for 15 or more verified evidence records.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>3. Source Freshness (20 Pts)</span>
                  <span className="font-mono text-cyan-700">Currency Ratio</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Recent sources (&lt;180 days) earn 1.0 weight; undated earn 0.6; outdated sources (&gt;180 days) are penalized with 0.2 weight.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>4. Verification Quality (15 Pts)</span>
                  <span className="font-mono text-cyan-700">Provenance Check</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Rewards official government & municipal registry data (8 pts), news media (4 pts), and penalizes unverified community rumors.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>5. Information Completeness (15 Pts)</span>
                  <span className="font-mono text-cyan-700">Critical Deductions</span>
                </div>
                <p className="text-[11px] text-slate-600">
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
