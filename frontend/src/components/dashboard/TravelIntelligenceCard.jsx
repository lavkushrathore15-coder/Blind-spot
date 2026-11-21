import React, { useState } from 'react';
import {
  ShieldAlert,
  Moon,
  Bus,
  Scale,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react';
import Badge from '../common/Badge';

export const TravelIntelligenceCard = ({ travelIntelligence, className }) => {
  const [activeTab, setActiveTab] = useState('scams');

  if (!travelIntelligence) return null;

  const { scams = [], nightSafety = {}, transit = {}, culturalLegal = [] } = travelIntelligence;

  const tabs = [
    { id: 'scams', label: 'Scam Traps', count: scams.length, icon: ShieldAlert },
    { id: 'night', label: 'Night Safety', icon: Moon },
    { id: 'transit', label: 'Transit Security', icon: Bus },
    { id: 'cultural', label: 'Legal & Cultural', count: culturalLegal.length, icon: Scale },
  ];

  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 flex flex-col shadow-glass-light ${className || ''}`}>
      {/* Header & Category Tab Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Travel Intelligence Telematics</h3>
          <p className="text-xs text-slate-500">Contextual warnings and localized avoidance strategies</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-cyan-800 font-bold border border-slate-200/90 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-cyan-50 text-cyan-800 font-bold' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="pt-4 flex-1">
        {/* Scams View */}
        {activeTab === 'scams' && (
          <div className="space-y-3.5">
            {scams.map((scam) => (
              <div
                key={scam.id}
                className="p-4 rounded-xl bg-white/70 border border-slate-200/90 hover:border-slate-300 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{scam.title}</h4>
                  <Badge
                    variant={
                      scam.severity === 'Critical'
                        ? 'danger'
                        : scam.severity === 'High'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {scam.severity} Severity
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{scam.description}</p>
                <div className="mt-2 p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-950">Prevention Rule: </span>
                    <span className="font-medium">{scam.prevention}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Night Safety View */}
        {activeTab === 'night' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                <Moon className="w-4 h-4 text-indigo-600" />
                <h4>Nighttime Mobility Protocol</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{nightSafety.safetyHours}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Solo Walking Recommendation:</span>
                  <p className="text-slate-600 text-[11px]">{nightSafety.soloWalking}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Taxi Protocol:</span>
                  <p className="text-slate-600 text-[11px]">{nightSafety.taxiProtocol}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transit Security View */}
        {activeTab === 'transit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/70 border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                <Bus className="w-4 h-4 text-cyan-600" />
                <h4>Transit Security Profile</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{transit.overview}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Recommended Method:</span>
                  <p className="text-slate-600 text-[11px]">{transit.recommended}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Airport & Hub Protocol:</span>
                  <p className="text-slate-600 text-[11px]">{transit.airportProtocol}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal & Cultural View */}
        {activeTab === 'cultural' && (
          <div className="space-y-3">
            {culturalLegal.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/70 border border-slate-200/90 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{item.law || item.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                {item.penalty && (
                  <div className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-block">
                    Penalty: {item.penalty}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelIntelligenceCard;
