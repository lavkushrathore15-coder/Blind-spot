import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Compass,
  Download,
  Share2,
  Calendar,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Printer,
  Check,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import DestinationOverviewCard from '../components/dashboard/DestinationOverviewCard';
import AwarenessIndexCard from '../components/dashboard/AwarenessIndexCard';
import InteractiveMapArea from '../components/map/InteractiveMapArea';
import AiFindingsCard from '../components/dashboard/AiFindingsCard';
import TravelIntelligenceCard from '../components/dashboard/TravelIntelligenceCard';
import EmergencyFacilitiesCard from '../components/dashboard/EmergencyFacilitiesCard';
import SourceExplorerCard from '../components/dashboard/SourceExplorerCard';
import LiveSerpApiExplorer from '../components/dashboard/LiveSerpApiExplorer';
import EmergencyLocationIntelligence from '../components/emergency/EmergencyLocationIntelligence';
import AiBlindSpotAnalysis from '../components/ai/AiBlindSpotAnalysis';
import ForgottenChecklistCard from '../components/ai/ForgottenChecklistCard';
import aiService from '../services/aiService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentInvestigation, investigations, setCurrentInvestigation, sampleDestinations } = useInvestigation();
  const [toastMessage, setToastMessage] = useState('');
  const [checklistData, setChecklistData] = useState([]);
  const [checklistTotalEvidence, setChecklistTotalEvidence] = useState(0);
  const [isAuditingChecklist, setIsAuditingChecklist] = useState(false);

  const handleRefreshChecklist = async () => {
    const dest = currentInvestigation?.destinationName || report?.city;
    if (!dest) return;
    setIsAuditingChecklist(true);
    try {
      const res = await aiService.getForgottenChecklist(dest);
      if (res?.data?.forgottenChecklist) {
        setChecklistData(res.data.forgottenChecklist);
        setChecklistTotalEvidence(res.data.totalEvidenceCount || 0);
        showToast('Forgotten checklist updated with verified audit.');
      }
    } catch (err) {
      console.warn('Checklist audit error:', err);
    } finally {
      setIsAuditingChecklist(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `BlindSpot Intelligence — ${currentInvestigation?.destinationName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Dashboard link copied to clipboard!');
    }
  };

  const handleExport = () => {
    showToast('Compiling high-resolution tactical PDF dossier...');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  // If no investigation is currently active (empty state)
  if (!currentInvestigation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
          <FolderOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Active Investigation Loaded</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select a verified sample destination from the intelligence catalog or initiate a customized investigation.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => {
              const defaultSample = investigations[0] || {
                id: 'inv-bogota-sample',
                destinationId: 'bogota-colombia',
                destinationName: 'Bogotá, Colombia',
                dates: { start: '2026-12-05', end: '2026-12-14', days: 9 },
                travellerType: 'Solo Female Traveller',
                riskProfile: 'Balanced Caution',
                createdAt: new Date().toISOString(),
                awarenessIndex: 64,
                advisoryLevel: 'Level 2: Exercise Increased Caution',
                isSample: true,
                reportData: sampleDestinations[0],
              };
              setCurrentInvestigation(defaultSample);
            }}
            icon={Sparkles}
          >
            Load Sample Investigation (Bogotá)
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/investigate')}
            icon={Compass}
          >
            Launch New Investigation
          </Button>
        </div>
      </div>
    );
  }

  const report = currentInvestigation.reportData || sampleDestinations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prominent Sample / Live Content Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-navy-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">
            {report.isCustomDestination || !currentInvestigation.isSample
              ? 'Live Grounded Intelligence Dossier'
              : 'Demonstration Intelligence Dossier'}
          </span>
          <span className="text-slate-400 hidden md:inline">
            {report.isCustomDestination || !currentInvestigation.isSample
              ? '— Real-time intelligence synthesized from live search, SerpApi Google Maps, and AI verification.'
              : '— All data below is clearly labeled sample telemetry for Phase 2 frontend verification.'}
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-slate-400 text-[11px]">Active Investigation:</span>
          <select
            value={currentInvestigation.destinationId}
            onChange={(e) => {
              const matched = sampleDestinations.find((d) => d.id === e.target.value);
              if (matched) {
                const switchInv = {
                  ...currentInvestigation,
                  id: `inv-${matched.id}`,
                  destinationId: matched.id,
                  destinationName: `${matched.city}, ${matched.country}`,
                  awarenessIndex: matched.awarenessIndex.overall,
                  reportData: matched,
                  isSample: true,
                };
                setCurrentInvestigation(switchInv);
              }
            }}
            className="bg-navy-800 border border-navy-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          >
            {report.isCustomDestination && (
              <option value={currentInvestigation.destinationId}>
                {report.flag || '📍'} {currentInvestigation.destinationName} (Active)
              </option>
            )}
            {sampleDestinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.flag} {d.city}, {d.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{report.flag}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentInvestigation.destinationName}
                </h1>
                <Badge variant={currentInvestigation.isSample ? "info" : "success"}>
                  {currentInvestigation.isSample ? "Phase 2 Tactical Grid" : "Live Grounded Intelligence"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investigation Record: <span className="font-mono text-slate-300">{currentInvestigation.id}</span>
              </p>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="mt-3 flex items-center gap-3 flex-wrap text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 bg-navy-900/80 px-2.5 py-1 rounded-lg border border-navy-800">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentInvestigation.dates.start} to {currentInvestigation.dates.end} ({currentInvestigation.dates.days} Days)</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-300 bg-navy-900/80 px-2.5 py-1 rounded-lg border border-navy-800">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentInvestigation.travellerType}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={Share2}
          >
            Share
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={Download}
          >
            Export Dossier
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/report')}
            icon={FileText}
          >
            Detailed Intelligence Report
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Row 1: Destination Overview & BlindSpot Awareness Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DestinationOverviewCard
          destination={report}
          className="lg:col-span-2"
        />
        <AwarenessIndexCard
          awarenessIndex={report.awarenessIndex}
          className="lg:col-span-1"
        />
      </div>

      {/* Row 2: Interactive Map Area (Real Geographical Leaflet Map) */}
      <InteractiveMapArea
        destination={report}
        destinationName={currentInvestigation?.destinationName || `${report?.city}, ${report?.country}`}
      />

      {/* Row 3: AI BlindSpot Discoveries & Forgotten Checklist (Phase 5 AI Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiBlindSpotAnalysis
          destinationName={currentInvestigation?.destinationName || report?.city}
          initialFindings={report.aiFindings}
          onChecklistUpdate={(newList, totalCount) => {
            setChecklistData(newList);
            setChecklistTotalEvidence(totalCount);
          }}
        />
        <ForgottenChecklistCard
          checklist={checklistData}
          totalEvidenceCount={checklistTotalEvidence}
          isLoading={isAuditingChecklist}
          onRefresh={handleRefreshChecklist}
        />
      </div>

      {/* Row 4: Travel Intelligence & Emergency Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TravelIntelligenceCard travelIntelligence={report.travelIntelligence} />
        <EmergencyFacilitiesCard facilities={report.emergencyFacilities} />
      </div>

      {/* Row 5: Real Emergency & Location Intelligence (SerpApi Google Maps) */}
      <EmergencyLocationIntelligence destinationName={currentInvestigation?.destinationName || report?.city} />

      {/* Row 6: Live SerpApi Multi-Stream Discovery Engine */}
      <LiveSerpApiExplorer destinationName={currentInvestigation?.destinationName || report?.city} />

      {/* Row 7: Verified Source Explorer Catalog */}
      <SourceExplorerCard sources={report.sources} />

      {/* Bottom CTA to Full Dossier */}
      <div className="p-6 rounded-2xl glass-card border border-navy-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Need Offline Emergency Protocols & Threat Matrices?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            View the printable comprehensive briefing including phonetic phrasebooks and neighborhood risk corridors.
          </p>
        </div>
        <Button
          onClick={() => navigate('/report')}
          icon={FileText}
        >
          Open Detailed Intelligence Dossier
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
