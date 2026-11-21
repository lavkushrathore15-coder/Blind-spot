import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Shield,
  Compass,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Lock,
  Globe2,
  Users,
  Building,
  HeartHandshake
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { sampleDestinations, setCurrentInvestigation, investigations } = useInvestigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDestinations = sampleDestinations.filter(
    (d) =>
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDestination = (dest) => {
    // Check if an investigation for this destination already exists in history
    const existing = investigations.find((inv) => inv.destinationId === dest.id);
    if (existing) {
      setCurrentInvestigation(existing);
    } else {
      // Create quick investigation wrapper
      const quickInv = {
        id: `inv-${dest.id}-quick`,
        destinationId: dest.id,
        destinationName: `${dest.city}, ${dest.country}`,
        dates: { start: '2026-12-10', end: '2026-12-20', days: 10 },
        travellerType: 'Independent Traveller',
        riskProfile: 'Balanced Caution',
        createdAt: new Date().toISOString(),
        awarenessIndex: dest.awarenessIndex.overall,
        advisoryLevel: `Level ${dest.advisory.level}: ${dest.advisory.label}`,
        isSample: true,
        reportData: dest,
      };
      setCurrentInvestigation(quickInv);
    }
    navigate('/dashboard');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredDestinations.length > 0) {
      handleSelectDestination(filteredDestinations[0]);
    } else if (searchQuery.trim()) {
      navigate(`/investigate?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/investigate');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-850/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-6 shadow-glow-cyan-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>BlindSpot Intelligence v2.0 — Uncover Hidden Travel Realities</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Travel Without <span className="text-gradient-cyan">BlindSpots</span>.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The intelligence platform that exposes localized risks, scam syndicates, nighttime transit corridors, and verified 24/7 medical infrastructure before you pack.
        </p>

        {/* Destination Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center glass-card rounded-2xl p-2 border border-navy-700/80 shadow-2xl focus-within:border-cyan-500/70 focus-within:shadow-glow-cyan transition-all">
            <Search className="w-5 h-5 text-cyan-400 ml-3.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search destination (e.g. Bogotá, Bangkok, Paris, Nairobi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
            />
            <Button type="submit" size="md" className="flex-shrink-0">
              Investigate
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Suggestion Pills */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="text-slate-500">Popular investigations:</span>
            {['Bogotá', 'Bangkok', 'Paris', 'Nairobi'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  const match = sampleDestinations.find((d) => d.city === city);
                  if (match) handleSelectDestination(match);
                }}
                className="px-2.5 py-1 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-cyan-300 border border-navy-750 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Featured Sample Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between pb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Live Intelligence Catalog
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Pre-Investigated Destinations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive telemetry dossiers ready for immediate tactical review
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/investigate')}
            icon={Compass}
          >
            Custom Investigation Form
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleDestinations.map((dest) => {
            const index = dest.awarenessIndex.overall;
            const badgeVariant = index >= 75 ? 'success' : index >= 60 ? 'warning' : 'danger';

            return (
              <div
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-navy-700/60 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{dest.flag}</span>
                    <Badge variant={badgeVariant}>
                      Index: {index}/100
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                    {dest.city}
                  </h3>
                  <p className="text-xs text-slate-400">{dest.country} • {dest.region}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-navy-900/60 border border-navy-800 text-xs space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Primary Alert</span>
                    <p className="text-slate-200 line-clamp-2 leading-relaxed">
                      {dest.advisory.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {dest.emergencyFacilities.length} Emergency Hubs
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                    View Brief <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why BlindSpot - Architectural Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Beyond Generic Travel Advisories
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Standard government advisories declare entire countries "Level 2" or "Level 3" without telling you which specific streets, hospital corridors, or airport taxi booths are safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">The Awareness Index™</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesizes physical safety, scam prevalence, transit friction, and medical infrastructure into a single unified score calibrated to your traveller profile.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Emergency Grid Mapping</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly discover JCI-accredited bilingual hospitals, consular emergency offices, and safe haven precincts with direct phone dial and offline coordinates.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">AI BlindSpot Extraction</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects counter-intuitive pitfalls: local prescription bans (ADHD/codeine restrictions), door grab-and-run tactics, and unwritten cultural codes.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Sample Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700/70 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dedicated to Solo, Family & Independent Explorers</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All intelligence dossiers are backed by verifiable open diplomatic sources and municipal police data.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/investigate')}
            icon={Compass}
            className="flex-shrink-0"
          >
            Launch Investigation
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
