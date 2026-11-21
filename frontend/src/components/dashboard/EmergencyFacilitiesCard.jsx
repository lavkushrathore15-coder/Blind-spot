import React, { useState } from 'react';
import {
  Hospital,
  Building,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import Badge from '../common/Badge';

export const EmergencyFacilitiesCard = ({ facilities = [], className }) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyPhone = (id, phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-navy-700/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Emergency Facilities & Safe Havens</h3>
            <p className="text-xs text-slate-400">JCI-accredited hospitals, diplomatic missions & walk-in clinics</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">{facilities.length} Verified Locations</span>
      </div>

      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className={`p-4 rounded-xl bg-navy-900/60 border transition-all flex flex-col justify-between space-y-3 ${
              fac.isTopChoice ? 'border-cyan-500/40 shadow-glow-cyan-sm' : 'border-navy-800 hover:border-navy-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
                  {fac.type}
                </span>
                {fac.isTopChoice && (
                  <Badge variant="info">Primary Pick</Badge>
                )}
              </div>

              <h4 className="text-sm font-bold text-white mt-1 leading-snug">{fac.name}</h4>

              <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{fac.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Bilingual Staff: {fac.englishStaff}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{fac.address} ({fac.distance})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-cyan-300">{fac.phone}</span>
              <button
                onClick={() => copyPhone(fac.id, fac.phone)}
                className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
              >
                {copiedId === fac.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Phone</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyFacilitiesCard;
