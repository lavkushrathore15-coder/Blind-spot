import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export const AiFindingsCard = ({ findings = [], className }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 flex flex-col shadow-glass-light ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI BlindSpot Discoveries</h3>
            <p className="text-xs text-slate-500">Hidden friction points, high-impact anomalies & non-obvious advice</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold">
          Synthesized from Multilateral Feeds
        </span>
      </div>

      <div className="pt-4 space-y-4 flex-1">
        {findings.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white/70 border border-slate-200/90 hover:border-cyan-500/40 hover:bg-white transition-all space-y-2.5 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                {item.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">
                  Confidence: <span className="text-cyan-700 font-bold">{item.confidence}%</span>
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

            <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.finding}</p>

            <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 flex items-start gap-2.5 text-xs text-cyan-900 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-950">Actionable Mitigation: </span>
                <span className="font-medium">{item.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiFindingsCard;
