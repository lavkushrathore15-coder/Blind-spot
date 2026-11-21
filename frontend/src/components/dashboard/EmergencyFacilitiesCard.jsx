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
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 flex flex-col shadow-glass-light ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xs">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Emergency Facilities & Safe Havens</h3>
            <p className="text-xs text-slate-500">JCI-accredited hospitals, diplomatic missions & walk-in clinics</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-800 font-semibold">{facilities.length} Verified Locations</span>
      </div>

      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className={`p-4 rounded-xl bg-white/70 border transition-all flex flex-col justify-between space-y-3 shadow-xs ${
              fac.isTopChoice ? 'border-cyan-400 bg-white shadow-sm' : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
                  {fac.type}
                </span>
                {fac.isTopChoice && (
                  <Badge variant="info">Primary Pick</Badge>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{fac.name}</h4>

              <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span>{fac.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Bilingual Staff: {fac.englishStaff}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{fac.address} ({fac.distance})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-800">{fac.phone}</span>
              <button
                onClick={() => copyPhone(fac.id, fac.phone)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 text-xs transition-colors font-medium"
              >
                {copiedId === fac.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
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
