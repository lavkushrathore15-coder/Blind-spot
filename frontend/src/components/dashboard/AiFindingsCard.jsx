import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export const AiFindingsCard = ({ findings = [], className }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-navy-700/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI BlindSpot Discoveries</h3>
            <p className="text-xs text-slate-400">Hidden friction points, high-impact anomalies & non-obvious advice</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
          Synthesized from Multilateral Feeds
        </span>
      </div>

      <div className="pt-4 space-y-4 flex-1">
        {findings.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 hover:border-navy-700 transition-all space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {item.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Confidence: <span className="text-cyan-400 font-semibold">{item.confidence}%</span>
                </span>
                <Badge
                  variant={
                    item.severity === 'Critical'
                      ? 'danger'
                      : item.severity === 'High'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {item.severity}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.finding}</p>

            <div className="p-3 rounded-lg bg-navy-950/80 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300">Actionable Mitigation: </span>
                <span>{item.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiFindingsCard;
