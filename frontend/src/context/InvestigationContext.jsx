import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_DESTINATIONS } from '../data/sampleDestinations';
import { buildCustomDestinationReport } from '../utils/destinationMetadata';
import weatherService from '../services/weatherService';

const InvestigationContext = createContext(null);

const STORAGE_KEY = 'blindspot_investigations_v2';
const CURRENT_KEY = 'blindspot_current_investigation_v2';

/**
 * Automatically repairs corrupted/stale stored investigations where a custom
 * destination accidentally inherited Bogotá sample data in earlier sessions.
 */
function sanitizeInvestigation(inv) {
  if (!inv) return null;
  const destName = (inv.destinationName || '').toLowerCase();
  const isBogotaName = destName.includes('bogot');
  const hasBogotaData =
    inv.reportData?.city === 'Bogotá' ||
    inv.reportData?.id === 'bogota-colombia' ||
    inv.reportData?.overview?.quickFacts?.currency?.includes('COP') ||
    inv.reportData?.overview?.emergencyNumbers?.touristPolice?.includes('+57');

  if (!isBogotaName && hasBogotaData) {
    const rawDest = inv.destinationName || '';
    const parts = rawDest.split(',');
    const city = parts[0]?.trim() || '';
    const country = parts.slice(1).join(',').trim() || '';

    const repairedReport = buildCustomDestinationReport({
      destinationCity: city,
      destinationCountry: country,
      destinationInput: rawDest,
      travellerType: inv.travellerType,
    });

    return {
      ...inv,
      destinationId: repairedReport.id,
      destinationName: `${repairedReport.city}, ${repairedReport.country}`,
      awarenessIndex: repairedReport.awarenessIndex?.overall || 82,
      advisoryLevel: `${repairedReport.advisory?.label || 'Normal Precautions'} (Level ${repairedReport.advisory?.level || 1})`,
      isSample: false,
      reportData: repairedReport,
    };
  }

  return inv;
}

export const InvestigationProvider = ({ children }) => {
  // Initialize investigations from localStorage or default samples
  const [investigations, setInvestigations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeInvestigation);
        }
      }
    } catch (e) {
      console.error('Failed to load investigations from localStorage', e);
    }

    // Default sample investigations
    return [
      {
        id: 'inv-bogota-sample',
        destinationId: 'bogota-colombia',
        destinationName: 'Bogotá, Colombia',
        dates: { start: '2026-12-05', end: '2026-12-14', days: 9 },
        travellerType: 'Solo Female Traveller',
        riskProfile: 'Balanced Caution',
        createdAt: '2026-11-20T10:30:00.000Z',
        awarenessIndex: 64,
        advisoryLevel: 'Level 2: Exercise Increased Caution',
        isSample: true,
        reportData: SAMPLE_DESTINATIONS[0],
      },
      {
        id: 'inv-bangkok-sample',
        destinationId: 'bangkok-thailand',
        destinationName: 'Bangkok, Thailand',
        dates: { start: '2026-12-18', end: '2026-12-28', days: 10 },
        travellerType: 'Digital Nomad',
        riskProfile: 'Standard Exploration',
        createdAt: '2026-11-19T14:15:00.000Z',
        awarenessIndex: 82,
        advisoryLevel: 'Level 1: Exercise Normal Precautions',
        isSample: true,
        reportData: SAMPLE_DESTINATIONS[1],
      },
      {
        id: 'inv-paris-sample',
        destinationId: 'paris-france',
        destinationName: 'Paris, France',
        dates: { start: '2026-12-22', end: '2027-01-02', days: 11 },
        travellerType: 'Family with Kids',
        riskProfile: 'High Caution',
        createdAt: '2026-11-18T09:00:00.000Z',
        awarenessIndex: 76,
        advisoryLevel: 'Level 2: Exercise Increased Caution',
        isSample: true,
        reportData: SAMPLE_DESTINATIONS[2],
      },
    ];
  });

  // Current active investigation
  const [currentInvestigation, setCurrentInvestigation] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return sanitizeInvestigation(parsed);
      }
    } catch (e) {
      console.error('Failed to load current investigation from localStorage', e);
    }
    // Default to the first sample
    return {
      id: 'inv-bogota-sample',
      destinationId: 'bogota-colombia',
      destinationName: 'Bogotá, Colombia',
      dates: { start: '2026-12-05', end: '2026-12-14', days: 9 },
      travellerType: 'Solo Female Traveller',
      riskProfile: 'Balanced Caution',
      createdAt: '2026-11-20T10:30:00.000Z',
      awarenessIndex: 64,
      advisoryLevel: 'Level 2: Exercise Increased Caution',
      isSample: true,
      reportData: SAMPLE_DESTINATIONS[0],
    };
  });

  // Simulation state
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationStage, setInvestigationStage] = useState('');
  const [investigationProgress, setInvestigationProgress] = useState(0);

  // Sync investigations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investigations));
    } catch (e) {
      console.error('Failed to persist investigations', e);
    }
  }, [investigations]);

  // Sync current investigation to localStorage
  useEffect(() => {
    if (currentInvestigation) {
      try {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(currentInvestigation));
      } catch (e) {
        console.error('Failed to persist current investigation', e);
      }
    }
  }, [currentInvestigation]);

  /**
   * Run a new investigation simulation
   */
  const runInvestigation = async (formValues) => {
    setIsInvestigating(true);
    setInvestigationProgress(5);
    setInvestigationStage('Connecting to global consular and security intelligence feeds...');

    const stages = [
      { progress: 25, text: 'Cross-referencing verified diplomatic advisories (OSAC, FCDO, WHO)...' },
      { progress: 50, text: 'Scanning localized crime telemetry, scam hotspots & night transit corridors...' },
      { progress: 75, text: 'Mapping bilingual 24/7 emergency medical facilities & diplomatic safe havens...' },
      { progress: 90, text: 'Computing BlindSpot Awareness Index & personalized risk matrix...' },
      { progress: 100, text: 'Intelligence dossier compiled successfully.' },
    ];

    for (const step of stages) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInvestigationProgress(step.progress);
      setInvestigationStage(step.text);
    }

    // Match destination or fallback to rich template
    let matchedDestination = SAMPLE_DESTINATIONS.find(
      (d) =>
        d.id === formValues.destinationId ||
        d.city.toLowerCase() === formValues.destinationCity?.toLowerCase() ||
        (formValues.destinationInput && formValues.destinationInput.toLowerCase() === d.city.toLowerCase())
    );

    if (!matchedDestination) {
      // Build an accurate, dynamic profile without inheriting Bogotá Colombia
      matchedDestination = buildCustomDestinationReport({
        destinationCity: formValues.destinationCity,
        destinationCountry: formValues.destinationCountry,
        destinationInput: formValues.destinationInput,
        travellerType: formValues.travellerType,
      });
    }

    // Ingest live OpenWeather telemetry for destination
    try {
      const liveWeather = await weatherService.getDestinationWeather(
        matchedDestination.city || formValues.destinationCity || formValues.destinationInput,
        matchedDestination.coords
      );
      if (liveWeather?.seasonalClimate) {
        if (!matchedDestination.overview) matchedDestination.overview = {};
        matchedDestination.overview.seasonalClimate = liveWeather.seasonalClimate;
      }
    } catch (weatherErr) {
      console.warn('[InvestigationContext] Weather ingestion notice:', weatherErr);
    }

    const isCustom = Boolean(matchedDestination.isCustomDestination);
    const newInvestigation = {
      id: `inv-${Date.now()}`,
      destinationId: matchedDestination.id,
      destinationName: `${matchedDestination.city}, ${matchedDestination.country}`,
      dates: {
        start: formValues.startDate,
        end: formValues.endDate,
        days: formValues.durationDays || 7,
      },
      travellerType: formValues.travellerType || 'Solo Traveller',
      riskProfile: formValues.riskProfile || 'Standard Caution',
      priorities: formValues.priorities || ['Scam Avoidance', 'Emergency Readiness'],
      createdAt: new Date().toISOString(),
      awarenessIndex: matchedDestination.awarenessIndex?.overall || 82,
      advisoryLevel: `${matchedDestination.advisory?.label || 'Advisory Active'} (Level ${matchedDestination.advisory?.level || 1})`,
      isSample: !isCustom,
      reportData: matchedDestination,
    };

    setInvestigations((prev) => [newInvestigation, ...prev]);
    setCurrentInvestigation(newInvestigation);
    setIsInvestigating(false);

    return newInvestigation;
  };

  /**
   * Delete an investigation by ID
   */
  const deleteInvestigation = (id) => {
    setInvestigations((prev) => prev.filter((inv) => inv.id !== id));
    if (currentInvestigation?.id === id) {
      const remaining = investigations.filter((inv) => inv.id !== id);
      if (remaining.length > 0) {
        setCurrentInvestigation(remaining[0]);
      } else {
        setCurrentInvestigation(null);
      }
    }
  };

  /**
   * Reset sample data if needed
   */
  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_KEY);
    window.location.reload();
  };

  return (
    <InvestigationContext.Provider
      value={{
        investigations,
        currentInvestigation,
        setCurrentInvestigation,
        isInvestigating,
        investigationStage,
        investigationProgress,
        runInvestigation,
        deleteInvestigation,
        resetToSampleData,
        sampleDestinations: SAMPLE_DESTINATIONS,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
