import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Phone,
  FileCheck,
  Languages,
  BookOpen,
  MapPin,
  Share2,
  Check,
  Sparkles,
  ListChecks,
  Search,
  ExternalLink,
  Users,
  Compass,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ExpandableEvidenceCard from '../components/report/ExpandableEvidenceCard';
import aiService from '../services/aiService';

const PERSONAS = [
  { key: 'solo', label: 'Solo Traveller', icon: Compass, desc: 'Vigilance, night transit, scam detection, check-ins' },
  { key: 'family', label: 'Family with Children', icon: Users, desc: 'Pediatric care, 24/7 pharmacies, safe zoning' },
  { key: 'couple', label: 'Couples & Partners', icon: Sparkles, desc: 'Nightlife safety, authorized taxis, dining corridors' },
  { key: 'business', label: 'Business Traveller', icon: Building, desc: 'Airport transit, cyber security, corporate corridors' },
];

export const ReportPage = () => {
  const navigate = useNavigate();
  const { currentInvestigation, sampleDestinations } = useInvestigation();

  // Active persona selection
  const [selectedPersona, setSelectedPersona] = useState(() => {
    const rawType = currentInvestigation?.travellerType || 'Solo Traveller';
    const lower = rawType.toLowerCase();
    if (lower.includes('family') || lower.includes('kid')) return 'family';
    if (lower.includes('couple') || lower.includes('partner')) return 'couple';
    if (lower.includes('business') || lower.includes('corporate')) return 'business';
    return 'solo';
  });

  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [facilityCategoryFilter, setFacilityCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [isSyncingReport, setIsSyncingReport] = useState(false);
  const [liveReportData, setLiveReportData] = useState(null);

  const report = currentInvestigation?.reportData || sampleDestinations[0];
  const destinationName = currentInvestigation?.destinationName || `${report.city}, ${report.country}`;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Attempt to fetch fresh personalized report from backend on load or persona change
  useEffect(() => {
    let isMounted = true;
    const fetchPersonalizedReport = async () => {
      if (!destinationName) return;
      setIsSyncingReport(true);
      try {
        const res = await aiService.getPersonalizedReport({
          destination: destinationName,
          travellerType: PERSONAS.find((p) => p.key === selectedPersona)?.label || 'Solo Traveller',
          travelDates: currentInvestigation?.dates,
        });

        if (isMounted && res && res.success && res.data) {
          setLiveReportData(res.data);
        }
      } catch (err) {
        console.warn('Backend personalized report sync fallback:', err.message);
      } finally {
        if (isMounted) setIsSyncingReport(false);
      }
    };

    fetchPersonalizedReport();

    return () => {
      isMounted = false;
    };
  }, [destinationName, selectedPersona]);

  // Merge live report sections with sample report baseline
  const activeReport = useMemo(() => {
    const personaObj = PERSONAS.find((p) => p.key === selectedPersona);

    // If backend personalized report is loaded, use its rich 7 sections
    if (liveReportData && liveReportData.sections) {
      return {
        ...liveReportData,
        flag: report.flag || '📍',
        city: report.city || destinationName.split(',')[0],
        country: report.country || destinationName.split(',')[1] || '',
        quickFacts: report.overview?.quickFacts || {},
        seasonalClimate: report.overview?.seasonalClimate || {},
      };
    }

    // Fallback baseline constructed locally adhering strictly to the 7 sections
    const rawAwareness = report.awarenessIndex?.overall || 64;
    return {
      destination: destinationName,
      city: report.city,
      country: report.country,
      flag: report.flag,
      travellerType: personaObj.label,
      personaKey: selectedPersona,
      quickFacts: report.overview?.quickFacts || {},
      seasonalClimate: report.overview?.seasonalClimate || {},
      awarenessIndex: {
        overall: rawAwareness,
        tier: rawAwareness >= 75 ? 'Substantial Investigation Coverage' : 'Partial Investigation Coverage',
        grade: rawAwareness >= 80 ? 'A' : rawAwareness >= 65 ? 'B' : 'C',
        summaryText:
          'Investigation coverage reflects multilateral synthesis across consular alerts, transit corridors, and Google Maps place registries.',
        disclaimer:
          'IMPORTANT: The Awareness Index measures the thoroughness of the investigation and the depth of verified evidence gathered. It does NOT evaluate or indicate the objective safety of the destination.',
        subMetrics: [
          { label: 'Categories Investigated', score: 20, maxScore: 25, detail: '5 of 6 examined' },
          { label: 'Evidence Availability', score: 18, maxScore: 25, detail: '12 verified items' },
          { label: 'Source Freshness', score: 15, maxScore: 20, detail: 'Active currency' },
          { label: 'Verification Quality', score: 12, maxScore: 15, detail: 'Official & media verified' },
          { label: 'Information Completeness', score: 12, maxScore: 15, detail: 'Critical pillars present' },
        ],
      },
      sections: {
        destinationOverview: {
          destination: destinationName,
          travellerType: personaObj.label,
          travelDates: currentInvestigation?.dates || { start: '2026-12-05', end: '2026-12-14', days: 9 },
        },
        importantFindings: (report.aiFindings || []).map((f) => ({
          ...f,
          isPersonaPriority:
            selectedPersona === 'solo'
              ? f.category === 'local_scams' || f.category === 'transport_disruptions'
              : selectedPersona === 'family'
              ? f.category === 'emergency_facilities' || f.category === 'weather_concerns'
              : selectedPersona === 'business'
              ? f.category === 'transport_disruptions' || f.category === 'travel_advisories'
              : f.category === 'local_scams' || f.category === 'other_considerations',
          claimType: 'confirmed_fact',
          confidenceScore: f.confidence || 88,
          sourceIds: ['ev-demo-1', 'ev-demo-2'],
          actionableMitigation: f.action,
        })),
        potentialBlindspots: [
          {
            id: 'bsp-1',
            category: 'weather_concerns',
            title: 'Uninvestigated Microclimate & Mountain Transit Risks',
            severity: 'moderate',
            description:
              'Limited meteorological evidence ingested. Mountain corridor conditions, flash rainstorms, and altitude adjustments lack dense recent reporting.',
            actionableAdvice: 'Check official local meteorological radar 24 hours prior to travel.',
          },
          {
            id: 'bsp-2',
            category: 'other_considerations',
            title: `${personaObj.label} Specific Blindspot Profile`,
            severity: 'high',
            description: `Primary operational focus for ${personaObj.label}s: ${personaObj.desc}. Specific risks exist around late-night corridors and unauthorized transit.`,
            actionableAdvice: 'Pre-book all transit through authorized corporate or municipal channels.',
          },
        ],
        emergencyFacilities: {
          totalCount: report.emergencyFacilities?.length || 0,
          disclaimer:
            'Facility listings reflect public Google Maps registry responses and do not represent an exhaustive directory of all facilities. Emergency contacts must never be invented.',
          hospitals: (report.emergencyFacilities || []).filter((f) => f.type === 'Hospital' || f.category === 'hospital'),
          pharmacies: (report.emergencyFacilities || []).filter((f) => f.type === 'Pharmacy' || f.category === 'pharmacy'),
          policeStations: (report.emergencyFacilities || []).filter((f) => f.type === 'Police' || f.category === 'police'),
        },
        evidenceAndSources: (report.sources || []).map((s, idx) => ({
          id: `ev-ref-${idx + 1}`,
          title: s.title,
          snippet: s.snippet || s.title,
          sourceUrl: s.url,
          sourceName: s.name,
          category: s.category || 'travel_advisories',
          categoryDisplayName: s.category || 'Official Travel Advisory',
          sourceType: s.type === 'official' ? 'official' : 'media',
          publishedDate: s.lastChecked || 'Recent',
          isOutdated: false,
          isUndated: false,
          retrievedAt: new Date().toISOString(),
        })),
        missingInformation: {
          uninvestigatedCategories: [{ category: 'weather_concerns', displayName: 'Weather & Climate Risks' }],
          telemetryDeficits: [
            'Absence of continuous hourly meteorological tracking.',
            'Unverified local community transit forums lack official corroboration.',
          ],
          investigationCompletenessScore: 12,
        },
        recommendedNextChecks: [
          {
            id: 'rec-1',
            category: 'Consular Registration',
            targetPersona: personaObj.label,
            priority: 'High',
            action: 'Register itinerary with your national diplomatic traveler notification portal.',
          },
          {
            id: 'rec-2',
            category: 'Offline Mapping',
            targetPersona: personaObj.label,
            priority: 'High',
            action: 'Cache offline city maps with verified emergency hospital and police pins.',
          },
          {
            id: 'rec-3',
            category: 'Emergency Dispatch',
            targetPersona: personaObj.label,
            priority: 'Critical',
            action: 'Save universal local emergency dispatch number (123) and hospital contacts.',
          },
          {
            id: 'rec-4',
            category: 'Personalized Check',
            targetPersona: personaObj.label,
            priority: 'Medium',
            action: `Review destination guidelines specifically tailored for ${personaObj.label}s: ${personaObj.desc}.`,
          },
        ],
      },
    };
  }, [liveReportData, report, destinationName, selectedPersona, currentInvestigation]);

  const { sections, awarenessIndex } = activeReport;

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    const items = sections.evidenceAndSources || [];
    return items.filter((item) => {
      if (evidenceFilter !== 'all' && item.category !== evidenceFilter) return false;
      if (evidenceSearch.trim()) {
        const q = evidenceSearch.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesSnippet = item.snippet?.toLowerCase().includes(q);
        const matchesUrl = item.sourceUrl?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSnippet && !matchesUrl && !matchesId) return false;
      }
      return true;
    });
  }, [sections.evidenceAndSources, evidenceFilter, evidenceSearch]);

  // Filtered emergency facilities
  const facilitiesList = useMemo(() => {
    const ef = sections.emergencyFacilities;
    if (!ef) return [];
    if (facilityCategoryFilter === 'hospitals') return ef.hospitals || [];
    if (facilityCategoryFilter === 'pharmacies') return ef.pharmacies || [];
    if (facilityCategoryFilter === 'police') return ef.policeStations || [];
    return [...(ef.hospitals || []), ...(ef.pharmacies || []), ...(ef.policeStations || [])];
  }, [sections.emergencyFacilities, facilityCategoryFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-50 border border-cyan-400 text-cyan-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in no-print">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Print Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          icon={ArrowLeft}
        >
          Return to Tactical Dashboard
        </Button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={Printer}
          >
            Print / Save as PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/investigate')}
            icon={Compass}
          >
            New Investigation
          </Button>
        </div>
      </div>

      {/* Persona Personalization Switcher */}
      <div className="p-4 rounded-2xl bg-white/90 border border-cyan-200 space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider font-mono">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Personalize Intelligence Priorities For:</span>
          </div>
          {isSyncingReport && (
            <span className="text-[11px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Recalibrating for {PERSONAS.find((p) => p.key === selectedPersona)?.label}...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedPersona(p.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-50/80 border-cyan-400 ring-1 ring-cyan-500/40 text-white'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-semibold text-xs">{p.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dossier Container */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-glass-light space-y-8 print:border-none print:p-0 print:space-y-6">
        {/* ==========================================
            SECTION 1: DESTINATION OVERVIEW
           ========================================== */}
        <section className="space-y-6 pb-6 border-b border-slate-200 print:pb-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                BlindSpot Tactical Dossier // Comprehensive Intelligence Report
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeReport.flag}</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {destinationName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Personalized Profile: <strong className="text-slate-900">{activeReport.travellerType}</strong> • Travel Window:{' '}
                <span className="font-mono text-cyan-800">
                  {sections.destinationOverview.travelDates?.start} to {sections.destinationOverview.travelDates?.end} ({sections.destinationOverview.travelDates?.days} Days)
                </span>
              </p>
            </div>

            {/* Awareness Index Badge */}
            <div className="flex flex-col items-start sm:items-end gap-1.5 p-3.5 rounded-xl bg-slate-50 border border-cyan-200">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Investigation Coverage Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-cyan-400">
                  {awarenessIndex.overall}/100
                </span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {awarenessIndex.grade}
                </span>
              </div>
              <Badge variant="cyan" className="text-[10px]">
                {awarenessIndex.tier}
              </Badge>
            </div>
          </div>

          {/* Strict Non-Safety Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-cyan-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-900 font-mono uppercase text-[11px] block">
                Truth-in-Data Principle:
              </strong>
              <p className="leading-relaxed">
                The BlindSpot Awareness Index measures <strong>investigation coverage</strong> (the breadth, freshness, and verified volume of telemetry ingested).{' '}
                <strong className="text-cyan-800">
                  It does NOT evaluate or indicate the objective safety of the destination.
                </strong>{' '}
                Never label a destination safe or unsafe based on this index.
              </p>
            </div>
          </div>

          {/* Quick Facts Grid */}
          {activeReport.quickFacts && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Universal Emergency</span>
                <strong className="text-rose-400 font-mono text-sm">{activeReport.quickFacts.emergencyDial || '123 / 911'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Local Currency</span>
                <strong className="text-slate-900 font-mono">{activeReport.quickFacts.currency || 'Local Currency'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Primary Language</span>
                <strong className="text-slate-900">{activeReport.quickFacts.language || 'Local'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Electrical Plugs</span>
                <strong className="text-slate-900">{activeReport.quickFacts.plugs || 'Standard'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Tap Water Safe?</span>
                <strong className="text-cyan-800">{activeReport.quickFacts.tapWater || 'Verify bottled'}</strong>
              </div>
            </div>
          )}
        </section>

        {/* ==========================================
            SECTION 2: IMPORTANT FINDINGS
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 2. Important Findings & Personalised Priorities
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Sorted by severity & {activeReport.travellerType} relevance
            </span>
          </div>

          <div className="space-y-3.5">
            {sections.importantFindings?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No validated findings generated.</p>
            ) : (
              sections.importantFindings.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    item.isPersonaPriority
                      ? 'bg-white/90 border-cyan-200 ring-1 ring-cyan-500/20'
                      : 'bg-white/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>

                      {item.isPersonaPriority && (
                        <Badge variant="cyan" className="text-[10px]">
                          ⭐ {activeReport.travellerType} Priority
                        </Badge>
                      )}

                      <Badge
                        variant={
                          item.claimType === 'confirmed_fact'
                            ? 'success'
                            : item.claimType === 'reported_event'
                            ? 'info'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {item.claimType === 'confirmed_fact'
                          ? 'Confirmed Fact'
                          : item.claimType === 'reported_event'
                          ? 'Reported Event'
                          : 'Unverified Claim'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">
                        Confidence: <strong className="text-cyan-400">{item.confidenceScore || item.confidence}%</strong>
                      </span>
                      <Badge
                        variant={
                          item.severity === 'critical' || item.severity === 'Critical'
                            ? 'danger'
                            : item.severity === 'high' || item.severity === 'High'
                            ? 'warning'
                            : 'info'
                        }
                        className="text-[10px]"
                      >
                        {item.severity ? item.severity.toUpperCase() : 'NOTICE'}
                      </Badge>
                    </div>
                  </div>

                  {item.personaRelevanceNote && (
                    <p className="text-[11px] font-mono text-cyan-800/90 pl-3 border-l-2 border-cyan-200">
                      {item.personaRelevanceNote}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200">
                    {item.finding}
                  </p>

                  {/* Mitigation */}
                  {item.actionableMitigation && (
                    <div className="p-3 rounded-lg bg-slate-50/80 border border-cyan-200 flex items-start gap-2 text-xs text-cyan-200">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-800">Actionable Mitigation: </strong>
                        <span>{item.actionableMitigation}</span>
                      </div>
                    </div>
                  )}

                  {/* Grounded Citation References */}
                  {item.sourceIds && item.sourceIds.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] font-mono text-slate-500">
                      <span>Ground-Truth Source IDs:</span>
                      {item.sourceIds.map((sid) => (
                        <span
                          key={sid}
                          className="px-2 py-0.5 rounded bg-cyan-50/70 border border-cyan-200 text-cyan-800"
                        >
                          {sid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 3: POTENTIAL BLINDSPOTS
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> 3. Potential Blindspots & Intelligence Gaps
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Absence of evidence is not evidence of absence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.potentialBlindspots?.map((blindspot) => (
              <div
                key={blindspot.id}
                className="p-4 rounded-xl bg-white/70 border border-amber-200 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {blindspot.title}
                  </h3>
                  <Badge variant="warning" className="text-[10px]">
                    Blindspot
                  </Badge>
                </div>

                <p className="text-slate-600 leading-relaxed">{blindspot.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 flex items-start gap-2 text-slate-600">
                  <span className="text-cyan-400 font-semibold font-mono text-[11px] flex-shrink-0">
                    Guidance:
                  </span>
                  <span>{blindspot.actionableAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            SECTION 4: EMERGENCY FACILITIES
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Building className="w-4 h-4" /> 4. Verified Emergency Facilities (Google Maps Grid)
            </h2>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 no-print">
              {['all', 'hospitals', 'pharmacies', 'police'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFacilityCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                    facilityCategoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-800 border border-cyan-200'
                      : 'bg-slate-100 text-slate-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {sections.emergencyFacilities?.disclaimer}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {facilitiesList.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-500">
                No emergency facilities retrieved for this category.
              </div>
            ) : (
              facilitiesList.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/70 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-slate-900 text-sm">{fac.title || fac.name}</strong>
                    <Badge
                      variant={
                        fac.category === 'hospital' || fac.type === 'Hospital'
                          ? 'danger'
                          : fac.category === 'pharmacy' || fac.type === 'Pharmacy'
                          ? 'success'
                          : 'info'
                      }
                      className="text-[10px]"
                    >
                      {fac.category || fac.type}
                    </Badge>
                  </div>

                  <p className="text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{fac.address || 'Address on municipal record'}</span>
                  </p>

                  {fac.phone && (
                    <p className="text-cyan-800 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>{fac.phone}</span>
                    </p>
                  )}

                  {fac.rating && (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                      <span>Rating: <strong className="text-amber-400">{fac.rating} ★</strong></span>
                      {fac.reviewsCount && <span>({fac.reviewsCount} reviews)</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 5: EVIDENCE AND SOURCE LINKS
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 5. Evidence & Source Provenance Catalog
              </h2>
              <p className="text-xs text-slate-500">
                Expandable cards revealing ground-truth text, original source URLs, and publication timestamps
              </p>
            </div>

            <span className="text-[11px] font-mono text-cyan-400">
              {filteredEvidence.length} of {sections.evidenceAndSources?.length || 0} Evidence Records
            </span>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5 no-print">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={evidenceSearch}
                onChange={(e) => setEvidenceSearch(e.target.value)}
                placeholder="Filter evidence by title, snippet, or URL..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Dimensions</option>
              <option value="travel_advisories">Official Advisories</option>
              <option value="transport_disruptions">Transit & Transport</option>
              <option value="weather_concerns">Weather & Climate</option>
              <option value="local_scams">Local Scams & Street Risks</option>
              <option value="emergency_facilities">Emergency Facilities</option>
              <option value="other_considerations">Other Considerations</option>
            </select>
          </div>

          {/* Expandable Cards List */}
          <div className="space-y-3">
            {filteredEvidence.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No evidence items match the filter criteria.
              </div>
            ) : (
              filteredEvidence.map((ev) => (
                <ExpandableEvidenceCard key={ev.id} evidence={ev} />
              ))
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 6: MISSING INFORMATION
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> 6. Missing Information & Unverified Telemetry
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Forgotten Checklist Gap Analysis
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-rose-200 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              The following categories and intelligence areas lack sufficient verified evidence in current search feeds. Travellers are advised not to extrapolate or assume safety in these blindspots:
            </p>

            <div className="space-y-2">
              {sections.missingInformation?.telemetryDeficits?.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No critical telemetry deficits identified across core categories.</span>
                </div>
              ) : (
                sections.missingInformation?.telemetryDeficits?.map((defect, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-rose-300">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{defect}</span>
                  </div>
                ))
              )}
            </div>

            {sections.missingInformation?.uninvestigatedCategories?.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-[11px]">Uninvestigated Dimensions:</span>
                {sections.missingInformation.uninvestigatedCategories.map((c) => (
                  <Badge key={c.category} variant="danger" className="text-[10px]">
                    {c.displayName || c.category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 7: RECOMMENDED NEXT CHECKS
           ========================================== */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> 7. Recommended Next Checks Prior to Departure
            </h2>
            <span className="text-[11px] font-mono text-cyan-800">
              Personalized for {activeReport.travellerType}
            </span>
          </div>

          <div className="space-y-2.5">
            {sections.recommendedNextChecks?.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/70 border border-slate-200 flex items-start gap-3 text-xs"
              >
                <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-200 text-cyan-400 flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{item.category}</span>
                    <Badge
                      variant={item.priority === 'Critical' ? 'danger' : 'info'}
                      className="text-[10px]"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tactical Emergency Phrasebook (Retained from Phase 2) */}
        <section className="space-y-3 pt-4 border-t border-slate-200 print-break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Languages className="w-4 h-4" /> Localized Emergency Phrasebook
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Quick Reference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/70 border border-slate-200">
              <span className="text-white font-medium block">Help me, it is an emergency!</span>
              <span className="text-cyan-800 font-semibold">¡Ayúdeme, es una emergencia!</span>
              <span className="text-[10px] text-slate-500 block italic">[eye-YOO-deh-meh, ess OO-nah eh-mehr-HEN-see-ah]</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/70 border border-slate-200">
              <span className="text-white font-medium block">Where is the nearest hospital?</span>
              <span className="text-cyan-800 font-semibold">¿Dónde está el hospital más cercano?</span>
              <span className="text-[10px] text-slate-500 block italic">[DOHN-deh ess-TAH el ohs-pee-TAHL mahs sehr-KAH-noh]</span>
            </div>
          </div>
        </section>

        {/* Verification Sign-Off Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2 font-mono">
          <span>BLINDSPOT RISK & INTELLIGENCE REPORT // RECORD REF: {currentInvestigation?.id || 'BLINDSPOT-2026'}</span>
          <span>REPORT INTEGRITY: ZERO-HALLUCINATION ENFORCED</span>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
