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
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 flex flex-col ${className || ''}`}>
      {/* Header & Category Tab Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-navy-700/50 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Travel Intelligence Telematics</h3>
          <p className="text-xs text-slate-400">Contextual warnings and localized avoidance strategies</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-900/80 border border-navy-700/60 text-xs overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-navy-950 font-semibold shadow-glow-cyan-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-navy-950 text-cyan-300' : 'bg-navy-800 text-slate-400'
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
                className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 hover:border-navy-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{scam.title}</h4>
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
                <p className="text-xs text-slate-300 leading-relaxed">{scam.description}</p>
                <div className="mt-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-300">Prevention Rule: </span>
                    {scam.prevention}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Night Safety View */}
        {activeTab === 'night' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Pedestrian Safety Hours:</span>
                <span className="text-indigo-300 font-normal">{nightSafety.safetyHours}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    Elevated Risk Night Zones
                  </span>
                  <ul className="text-xs text-rose-200/90 space-y-1 list-disc list-inside">
                    {nightSafety.highRiskZones?.map((z, idx) => (
                      <li key={idx}>{z}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Safe Corridors
                  </span>
                  <ul className="text-xs text-emerald-200/90 space-y-1 list-disc list-inside">
                    {nightSafety.safeCorridors?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transit Security View */}
        {activeTab === 'transit' && (
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Recommended Transport Modes
              </span>
              <p className="text-sm font-medium text-white">{transit.recommended}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-300">Public Transit Protocols:</span>
              <p className="text-slate-300 leading-relaxed">{transit.publicTransitNotes}</p>
            </div>

            <div className="space-y-1 text-xs p-3 rounded-lg bg-navy-950/80 border border-navy-800">
              <span className="font-semibold text-amber-300">Airport Arrival Guidance:</span>
              <p className="text-slate-300 leading-relaxed">{transit.airportProtocol}</p>
            </div>
          </div>
        )}

        {/* Cultural & Legal BlindSpots View */}
        {activeTab === 'cultural' && (
          <div className="space-y-3">
            {culturalLegal.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 space-y-1 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  {item.rule}
                </span>
                <p className="text-slate-300 pl-5 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelIntelligenceCard;
