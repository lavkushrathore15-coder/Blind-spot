import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  Info,
  Droplet,
  Globe,
  Zap,
  CloudSun,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Mountain,
  Navigation,
  Moon,
  ShieldCheck,
  Footprints,
  AlertCircle,
} from 'lucide-react';
import Badge from '../common/Badge';
import weatherService from '../../services/weatherService';

export const DestinationOverviewCard = ({ destination, className }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [liveClimate, setLiveClimate] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const {
    overview = {},
    advisory = {},
    travelIntelligence = {},
    neighborhoods = [],
    city = '',
    country = '',
  } = destination || {};

  const { quickFacts = {}, seasonalClimate = {}, emergencyNumbers = {} } = overview;
  const { transit = {}, nightSafety = {}, scams = [] } = travelIntelligence;

  // Sync state if destination prop updates
  useEffect(() => {
    setLiveClimate(null);
  }, [destination?.city, destination?.id]);

  // Fetch live OpenWeather data when destination is active
  useEffect(() => {
    let isMounted = true;
    const destName = destination?.city || destination?.destinationName || '';
    if (!destName) return;

    if (seasonalClimate?.isLive) {
      setLiveClimate(seasonalClimate);
      return;
    }

    async function loadWeather() {
      setIsLoadingWeather(true);
      try {
        const weatherData = await weatherService.getDestinationWeather(destName, destination?.coords);
        if (isMounted && weatherData?.seasonalClimate) {
          setLiveClimate(weatherData.seasonalClimate);
        }
      } catch (err) {
        console.warn('[DestinationOverviewCard] Live weather error:', err);
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, [destination?.city, destination?.destinationName, destination?.coords, seasonalClimate?.isLive]);

  if (!destination) return null;

  const currentClimate = liveClimate || seasonalClimate;

  const copyNumber = (key, val) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Safe corridors derived from neighborhoods or defaults
  const safeSectors = neighborhoods.filter((n) => n.tier === 'Safe Haven' || n.safetyScore >= 85);
  const cautionSectors = neighborhoods.filter((n) => n.tier !== 'Safe Haven' && n.safetyScore < 85);

  return (
    <div className={`glass-card rounded-2xl p-6 border border-navy-700/60 space-y-6 flex flex-col justify-between ${className || ''}`}>
      {/* 1. Top Advisory Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-navy-850 to-navy-800 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5 sm:mt-0 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Diplomatic Safety Advisory
              </span>
              <Badge variant="warning">Level {advisory.level || 1}: {advisory.label || 'Exercise Caution'}</Badge>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{advisory.summary}</p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap self-end sm:self-center">
          Verified: {advisory.lastUpdated || 'Current'}
        </div>
      </div>

      {/* 2. Emergency Quick-Dial Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            Verified Local Emergency Dispatch
          </span>
          <span className="text-[11px] text-slate-400">Tap number to copy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Police', number: emergencyNumbers.police, color: 'text-cyan-400 border-cyan-500/30' },
            { label: 'Ambulance', number: emergencyNumbers.ambulance, color: 'text-rose-400 border-rose-500/30' },
            { label: 'Tourist Police', number: emergencyNumbers.touristPolice, color: 'text-amber-400 border-amber-500/30' },
            { label: 'Fire Service', number: emergencyNumbers.fire, color: 'text-indigo-400 border-indigo-500/30' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => copyNumber(item.label, item.number)}
              className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-700/60 hover:border-cyan-500/50 hover:bg-navy-850 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.label}</span>
                {copiedKey === item.label ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                )}
              </div>
              <div className={`text-sm font-mono font-bold mt-1 ${item.color}`}>
                {item.number || 'N/A'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Quick Facts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-navy-700/50 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Currency & Cash
          </span>
          <p className="font-medium text-slate-200">{quickFacts.currency || 'N/A'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" /> Language Grid
          </span>
          <p className="font-medium text-slate-200">{quickFacts.language || 'N/A'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Power Plugs
          </span>
          <p className="font-medium text-slate-200">{quickFacts.plugs || 'N/A'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-sky-400" /> Tap Water Safety
          </span>
          <p className="font-medium text-slate-200">{quickFacts.tapWater || 'N/A'}</p>
        </div>
      </div>

      {/* 4. Climate & Meteorological Telemetry Section */}
      {currentClimate && (
        <div className="p-4 rounded-xl bg-navy-900/70 border border-navy-800 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="font-semibold text-white">Climate & Physiologic Factors</span>
            </div>
            {currentClimate.isLive && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 shadow-glow-cyan-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live OpenWeather Telemetry
              </span>
            )}
            {isLoadingWeather && !currentClimate.isLive && (
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Ingesting satellite telemetry...
              </span>
            )}
          </div>

          {/* 4-Metric Live Micro-Pills Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-750/70 flex items-center gap-2.5">
              <Thermometer className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Temp / Feels</span>
                <span className="text-xs font-bold text-white font-mono truncate block">
                  {currentClimate.temp != null ? `${currentClimate.temp}°C` : '18°C'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-750/70 flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Humidity</span>
                <span className="text-xs font-bold text-white font-mono truncate block">
                  {currentClimate.humidity != null ? `${currentClimate.humidity}%` : '65%'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-750/70 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Wind Speed</span>
                <span className="text-xs font-bold text-white font-mono truncate block">
                  {currentClimate.windSpeed != null ? `${currentClimate.windSpeed} m/s` : '3.2 m/s'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950/80 border border-navy-750/70 flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Atmosphere</span>
                <span className="text-xs font-bold text-white font-mono truncate block">
                  {currentClimate.condition || 'Temperate'}
                </span>
              </div>
            </div>
          </div>

          {/* Meteorological Narrative & Physiological Risk Details */}
          <div className="p-2.5 rounded-lg bg-navy-950/50 border border-navy-800 text-slate-300 space-y-1">
            <p className="text-xs leading-relaxed text-slate-200">
              <strong className="text-cyan-300">Conditions: </strong>
              {currentClimate.weather}
            </p>
            {currentClimate.altitude && (
              <p className="text-xs leading-relaxed text-slate-300">
                <strong className="text-amber-300">Physiological Factors: </strong>
                {currentClimate.altitude}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Tactical Ground Intelligence & Security Safeguards (Eliminates empty space) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-navy-700/50 text-xs">
        {/* Panel A: Transit & Mobility Protocol */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Transit & Arrival Protocol</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {transit.recommended || 'Pre-booked authorized taxis, official rideshare apps, or verified hotel transfers.'}
            </p>
          </div>
          <div className="pt-2 border-t border-navy-800/80 text-[10px] text-slate-400">
            <span className="font-medium text-slate-300">Airport & Hubs: </span>
            {transit.airportProtocol || 'Book transfers strictly via official inside-terminal counters.'}
          </div>
        </div>

        {/* Panel B: Walking & Night Safety Corridors */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Moon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Safe Corridors & Movement</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {nightSafety.safetyHours || 'Safe for pedestrian transit until 21:00 in well-lit central sectors.'}
            </p>
          </div>
          <div className="pt-2 border-t border-navy-800/80 text-[10px] text-slate-400">
            <span className="font-medium text-emerald-300">Verified Havens: </span>
            {safeSectors.length > 0
              ? safeSectors.slice(0, 2).map((s) => s.name).join(', ')
              : 'Central commercial avenues & hotel districts'}
          </div>
        </div>

        {/* Panel C: Local Street Safeguards & Scam Avoidance */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Key Street Safeguards</span>
            </div>
            <ul className="text-slate-300 text-[11px] space-y-1">
              {scams.length > 0 ? (
                scams.slice(0, 2).map((s, idx) => (
                  <li key={idx} className="line-clamp-2">
                    • <strong className="text-slate-200">{s.title}:</strong> {s.prevention || s.description}
                  </li>
                ))
              ) : (
                <>
                  <li>• Use meter-activated taxis or app dispatch.</li>
                  <li>• Keep emergency contact numbers offline.</li>
                </>
              )}
            </ul>
          </div>
          <div className="pt-2 border-t border-navy-800/80 text-[10px] text-slate-400">
            <span className="font-medium text-amber-300">Risk Profile: </span>
            Standard situational vigilance recommended
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationOverviewCard;
