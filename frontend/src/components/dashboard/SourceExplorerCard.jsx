import React from 'react';
import { Database, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const SourceExplorerCard = ({ sources = [], className }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-navy-700/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Source Explorer & Audit Trail</h3>
            <p className="text-xs text-slate-400">Citations from sovereign diplomatic ministries & local municipal services</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {sources.length} Ingested Registries
        </span>
      </div>

      <div className="pt-4 space-y-3 flex-1">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-white">{src.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{src.organization}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {src.reliability}
                </Badge>
              </div>
            </div>

            <blockquote className="p-2.5 rounded bg-navy-950/80 border-l-2 border-cyan-500 text-slate-300 italic text-[11px] leading-relaxed">
              "{src.citation}"
            </blockquote>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Ingested: {src.updated}</span>
              <span className="text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer">
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
