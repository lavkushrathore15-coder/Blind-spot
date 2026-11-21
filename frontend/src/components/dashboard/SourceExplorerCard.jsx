import React from 'react';
import { Database, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const SourceExplorerCard = ({ sources = [], className }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 flex flex-col shadow-glass-light ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Source Explorer & Audit Trail</h3>
            <p className="text-xs text-slate-500">Citations from sovereign diplomatic ministries & local municipal services</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          {sources.length} Ingested Registries
        </span>
      </div>

      <div className="pt-4 space-y-3 flex-1">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-4 rounded-xl bg-white/70 border border-slate-200/90 space-y-2 text-xs shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900">{src.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{src.organization}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {src.reliability}
                </Badge>
              </div>
            </div>

            <blockquote className="p-2.5 rounded-xl bg-slate-50 border-l-2 border-cyan-600 text-slate-700 italic text-[11px] leading-relaxed">
              "{src.citation}"
            </blockquote>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Ingested: {src.updated}</span>
              <span className="text-cyan-700 flex items-center gap-1 hover:underline cursor-pointer font-semibold">
                Verified Registry Ref <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceExplorerCard;
