import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Users,
  Shield,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  FileSearch,
  Check
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

export const InvestigationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const {
    sampleDestinations,
    runInvestigation,
    isInvestigating,
    investigationStage,
    investigationProgress
  } = useInvestigation();

  // Form State
  const [destinationInput, setDestinationInput] = useState(initialQuery);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  useEffect(() => {
    if (initialQuery) {
      setDestinationInput(initialQuery);
    }
  }, [initialQuery]);

  const [startDate, setStartDate] = useState('2026-12-05');
  const [endDate, setEndDate] = useState('2026-12-14');
  const [travellerType, setTravellerType] = useState('Solo Female Traveller');
  const [riskProfile, setRiskProfile] = useState('Balanced Caution');
  const [priorities, setPriorities] = useState([
    'Scam Avoidance',
    'Emergency Medical Access',
    'Nighttime Walking Safety',
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate duration safely
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const travellerTypes = [
    { id: 'Solo Female Traveller', label: 'Solo Female', desc: 'Focus on harassment, nightlife drink safety, verified transit' },
    { id: 'Solo Male Traveller', label: 'Solo Male', desc: 'Focus on aggressive dating app scams, nightlife extortion' },
    { id: 'Family with Kids', label: 'Family with Kids', desc: 'Pedestrian safety, pediatric hospital access, clean water' },
    { id: 'Digital Nomad', label: 'Digital Nomad', desc: 'Co-working zone safety, device snatching, long-stay visa laws' },
    { id: 'Business Executive', label: 'Business Executive', desc: 'Secure airport transfers, express kidnapping mitigation' },
    { id: 'LGBTQ+ Explorer', label: 'LGBTQ+ Explorer', desc: 'Local legal protections, safe neighborhood corridors' },
  ];

  const priorityOptions = [
    'Scam Avoidance',
    'Emergency Medical Access',
    'Nighttime Walking Safety',
    'Airport & Taxi Security',
    'Local Legal Restrictions',
    'Food & Water Safety',
  ];

  const handlePresetSelect = (dest) => {
    setSelectedPresetId(dest.id);
    setDestinationInput(`${dest.city}, ${dest.country}`);
    setErrorMsg('');
  };

  const handleTogglePriority = (item) => {
    setPriorities((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedDest = destinationInput.trim();
    if (!trimmedDest) {
      setErrorMsg('Please specify a destination to investigate.');
      return;
    }
    if (trimmedDest.length < 2) {
      setErrorMsg('Destination name must be at least 2 characters long.');
      return;
    }
    if (trimmedDest.length > 120) {
      setErrorMsg('Destination name cannot exceed 120 characters.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg('Please specify both travel start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorMsg('Please provide valid travel dates in YYYY-MM-DD format.');
      return;
    }

    if (end < start) {
      setErrorMsg('Travel end date cannot be earlier than start date.');
      return;
    }

    setErrorMsg('');

    try {
      await runInvestigation({
        destinationId: selectedPresetId,
        destinationInput: trimmedDest,
        destinationCity: trimmedDest.split(',')[0].trim(),
        destinationCountry: trimmedDest.split(',').slice(1).join(',').trim() || '',
        startDate,
        endDate,
        durationDays,
        travellerType,
        riskProfile,
        priorities,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete investigation. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Compass className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Tactical Investigation Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          Configure Destination Investigation
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Specify your destination and traveller profile to calibrate localized threat scoring and emergency facilities.
        </p>
      </div>

      {/* Investigation Scanning Progress Modal / Overlay */}
      {isInvestigating && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 shadow-glow-cyan space-y-6 text-center animate-in fade-in duration-300 bg-slate-900/95">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center shadow-glow-cyan-sm">
                <FileSearch className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Synthesizing Travel Intelligence</h3>
              <p className="text-xs text-cyan-300 font-mono h-8 flex items-center justify-center font-semibold">
                {investigationStage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${investigationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 font-medium">
                <span>Multi-Source Ingestion</span>
                <span>{investigationProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: Destination Selection */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                1. Target Destination
              </h3>
              <span className="text-[11px] font-mono text-slate-300 font-medium">City & Country</span>
            </div>

            <Input
              placeholder="e.g. Bogotá, Colombia or Paris, France"
              value={destinationInput}
              onChange={(e) => {
                setDestinationInput(e.target.value);
                setSelectedPresetId('');
                setErrorMsg('');
              }}
              error={errorMsg}
              helperText="Type any destination or click a verified catalog destination below."
            />

            {/* Quick Catalog Presets */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-medium">Verified Catalog Presets:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sampleDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handlePresetSelect(dest)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedPresetId === dest.id
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-white shadow-glow-cyan-sm'
                        : 'bg-slate-900/80 border border-slate-700/80 text-slate-100 hover:border-slate-500 hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dest.flag}</span>
                      <span className="text-xs font-bold text-slate-100">{dest.city}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 block mt-0.5 font-medium">{dest.country}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Travel Dates */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                2. Travel Window & Duration
              </h3>
              <Badge variant="info" className="font-bold font-mono px-3 py-1">
                {durationDays} Days Total
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Departure / Arrival Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Return Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Traveller Profile */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              3. Traveller Demographic & Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {travellerTypes.map((type) => {
                const isSelected = travellerType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setTravellerType(type.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border-2 border-cyan-400 shadow-glow-cyan-sm'
                        : 'bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-cyan-300 font-extrabold' : 'text-slate-100'
                        }`}
                      >
                        {type.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] mt-1 leading-snug ${
                        isSelected ? 'text-cyan-100/90 font-medium' : 'text-slate-300'
                      }`}
                    >
                      {type.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Priority Risk Concerns */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              4. Key Areas of Concern
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {priorityOptions.map((opt) => {
                const selected = priorities.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleTogglePriority(opt)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                      selected
                        ? 'bg-indigo-950/80 border-2 border-indigo-400 text-indigo-100 shadow-glow-violet'
                        : 'bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800/90'
                    }`}
                  >
                    <span>{opt}</span>
                    {selected ? (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full shadow-glow-cyan font-bold"
              icon={Sparkles}
            >
              Initiate Tactical Intelligence Investigation
            </Button>
          </div>
        </form>

        {/* Sidebar Summary & Investigation Parameters */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5 sticky top-24 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700/80">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Investigation Scope</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Target Location:</span>
                <span className="font-bold text-white text-right">
                  {destinationInput || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Window:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {startDate} to {endDate}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Duration:</span>
                <span className="font-mono text-white font-bold">{durationDays} Days</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Demographic:</span>
                <span className="font-bold text-indigo-300">{travellerType}</span>
              </div>

              <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
                <span className="text-slate-300 block font-medium">Prioritized Feeds ({priorities.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {priorities.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-cyan-400 block">Demonstration Architecture:</span>
              <p className="leading-relaxed">
                Submitting executes the synthetic intelligence pipeline and persists the resulting dossier directly in your browser's encrypted history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationPage;
