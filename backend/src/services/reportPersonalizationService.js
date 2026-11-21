/**
 * BlindSpot Personalized Intelligence Report Service
 *
 * Tailors intelligence priorities, blindspots, and recommended next checks for:
 * 1. Solo Travellers (Female/Male/Independent Explorer)
 * 2. Families (Travelling with Children / Multi-Generational)
 * 3. Couples (Partners / Leisure / Honeymoon)
 * 4. Business Travellers (Corporate / Remote Work / Commercial)
 *
 * Generates the 7 Canonical Report Sections:
 * 1. Destination overview
 * 2. Important findings
 * 3. Potential blindspots
 * 4. Emergency facilities
 * 5. Evidence and source links
 * 6. Missing information
 * 7. Recommended next checks
 */

const AwarenessIndexService = require('./awarenessIndexService');
const { ANALYSIS_CATEGORIES, CATEGORY_DISPLAY_NAMES } = require('./aiSchema');

const PERSONA_CONFIGS = {
  solo: {
    key: 'solo',
    title: 'Solo Traveller',
    primaryFocus: 'Street vigilance, night transit safety, scam diversion detection & check-in cadences',
    priorityCategories: ['local_scams', 'transport_disruptions', 'emergency_facilities'],
    riskFocus: 'Opportunistic street robbery, unauthorized transit hail, isolated night corridors',
    recommendedChecks: [
      'Register with national consular travel notification service (e.g. US STEP, UK Travel Alert).',
      'Download offline municipal vector maps with pinned CAI / Police station waypoints.',
      'Establish a 24-hour scheduled check-in cadence with a designated emergency contact.',
      'Pre-install verified local ride-hail applications (e.g. Cabify/Uber) to prevent street hails after dusk.',
    ],
  },
  family: {
    key: 'family',
    title: 'Family with Children',
    primaryFocus: 'Pediatric emergency care, 24/7 pharmacies, safe family zoning & transit accessibility',
    priorityCategories: ['emergency_facilities', 'weather_concerns', 'travel_advisories'],
    riskFocus: 'Medical triage delay, environmental exposure, crowded transit disruption',
    recommendedChecks: [
      'Pin the nearest 24/7 emergency hospital with pediatric coverage to your family accommodation.',
      'Verify availability of specialized infant supplies, clean tap water alternatives, and bilingual pharmacies.',
      'Pre-arrange private door-to-door vetted transportation between airport and lodging.',
      'Confirm emergency medical evacuation coverage is active on your family travel insurance policy.',
    ],
  },
  couple: {
    key: 'couple',
    title: 'Couples & Partners',
    primaryFocus: 'Safe nightlife & dining corridors, authorized taxi dispatch, property security',
    priorityCategories: ['local_scams', 'travel_advisories', 'other_considerations'],
    riskFocus: 'Nighttime venue scamming, drink tampering, pickpocketing in crowded tourist plazas',
    recommendedChecks: [
      'Strictly arrange return transport inside dining or nightlife venues before leaving late at night.',
      'Split essential credentials and emergency debit cards between partners in separate RFID-shielded holders.',
      'Cross-check restaurant and lounge neighborhood corridors against daytime/nighttime zoning ratings.',
      'Save consular emergency contacts and international medical assistance numbers in both phones.',
    ],
  },
  business: {
    key: 'business',
    title: 'Business Traveller',
    primaryFocus: 'Airport corridor mobility, transit strike disruptions, cyber security & consular access',
    priorityCategories: ['transport_disruptions', 'travel_advisories', 'other_considerations'],
    riskFocus: 'Transit route blockades causing flight delays, cyber-theft in public hubs, business hotel security',
    recommendedChecks: [
      'Monitor municipal transit alert feeds and airport highway congestion 6 hours prior to flights.',
      'Enforce enterprise VPN encryption, multi-factor authentication, and privacy screens on mobile devices.',
      'Identify the commercial trade section and emergency consular officer at your national embassy.',
      'Confirm corporate travel insurance covers emergency flight redirection and equipment loss.',
    ],
  },
};

class ReportPersonalizationService {
  /**
   * Normalize traveller persona string
   */
  static normalizePersona(personaString) {
    if (!personaString || typeof personaString !== 'string') return 'solo';
    const lower = personaString.toLowerCase();
    if (lower.includes('family') || lower.includes('kid') || lower.includes('child')) return 'family';
    if (lower.includes('couple') || lower.includes('partner') || lower.includes('honeymoon')) return 'couple';
    if (lower.includes('business') || lower.includes('corporate') || lower.includes('executive')) return 'business';
    return 'solo';
  }

  /**
   * Compiles the 7-section personalized intelligence report
   */
  static generateReport({
    destination,
    travellerType = 'Solo Traveller',
    travelDates = { start: '2026-12-01', end: '2026-12-10', days: 9 },
    findings = [],
    evidenceItems = [],
    facilities = [],
    forgottenChecklist = [],
  }) {
    const personaKey = this.normalizePersona(travellerType);
    const personaConfig = PERSONA_CONFIGS[personaKey];

    // Calculate the reproducible Awareness Index
    const awarenessIndex = AwarenessIndexService.calculateIndex({
      destination,
      evidenceItems,
      forgottenChecklist,
    });

    // 1. SECTION 1: DESTINATION OVERVIEW
    const destinationOverview = {
      destination,
      travellerType: personaConfig.title,
      travelDates,
      awarenessIndex: {
        score: awarenessIndex.overall,
        tier: awarenessIndex.tier,
        grade: awarenessIndex.grade,
        summaryText: awarenessIndex.summaryText,
        disclaimer: awarenessIndex.disclaimer,
      },
      telemetrySnapshot: {
        totalEvidenceCount: evidenceItems.length,
        categoriesExamined: 6 - awarenessIndex.methodology.missingCategories.length,
        officialSourcesCount: awarenessIndex.methodology.provenanceMetrics.officialCount,
        verifiedFacilitiesCount: facilities.length,
      },
    };

    // 2. SECTION 2: IMPORTANT FINDINGS (Personalized priorities)
    // Sort findings: Persona-priority categories first, then by severity
    const severityRank = { critical: 4, high: 3, moderate: 2, low: 1 };
    const importantFindings = [...findings].map((f) => {
      const isPersonaPriority = personaConfig.priorityCategories.includes(f.category);
      return {
        ...f,
        isPersonaPriority,
        personaRelevanceNote: isPersonaPriority
          ? `High Operational Relevance for ${personaConfig.title}s (${personaConfig.primaryFocus})`
          : null,
      };
    });

    importantFindings.sort((a, b) => {
      // Prioritize persona match
      if (a.isPersonaPriority && !b.isPersonaPriority) return -1;
      if (!a.isPersonaPriority && b.isPersonaPriority) return 1;
      // Then severity
      const rankA = severityRank[a.severity] || 0;
      const rankB = severityRank[b.severity] || 0;
      return rankB - rankA;
    });

    // 3. SECTION 3: POTENTIAL BLINDSPOTS
    // Identify uninvestigated categories, outdated sources, and unverified telemetry
    const potentialBlindspots = [];

    // Category gaps
    for (const missing of awarenessIndex.methodology.missingCategories) {
      potentialBlindspots.push({
        id: `bsp-${missing.category}`,
        category: missing.category,
        title: `Uninvestigated Dimension: ${missing.displayName}`,
        severity: 'high',
        description: `Zero verified intelligence records have been ingested for ${missing.displayName.toLowerCase()}. Do not assume the absence of reported incidents equals safe conditions.`,
        actionableAdvice: `Conduct dedicated discovery into ${missing.displayName.toLowerCase()} prior to arrival.`,
      });
    }

    // Outdated telemetry blindspots
    const outdatedItems = evidenceItems.filter((e) => e.isOutdated);
    if (outdatedItems.length > 0) {
      potentialBlindspots.push({
        id: 'bsp-outdated-sources',
        category: 'other_considerations',
        title: `Temporal Staleness Warning: ${outdatedItems.length} Outdated Evidence Records`,
        severity: 'moderate',
        description: `${outdatedItems.length} referenced sources were published over 180 days ago. On-the-ground conditions, municipal regulations, and safety corridors may have evolved.`,
        actionableAdvice: 'Cross-reference outdated findings with recent local news and social civic alerts.',
      });
    }

    // Persona-specific blindspot emphasis
    potentialBlindspots.push({
      id: `bsp-persona-${personaKey}`,
      category: 'other_considerations',
      title: `${personaConfig.title} Specific Blindspot Profile`,
      severity: 'moderate',
      description: `Primary operational risk profile for ${personaConfig.title}s centers on: ${personaConfig.riskFocus}.`,
      actionableAdvice: personaConfig.recommendedChecks[0],
    });

    // 4. SECTION 4: EMERGENCY FACILITIES (Google Maps place registry)
    const emergencyFacilities = {
      totalCount: facilities.length,
      disclaimer:
        'Facility listings represent public Google Maps registry responses retrieved during investigation and do not constitute an exhaustive directory of all municipal services. Emergency contacts must never be invented.',
      hospitals: facilities.filter((f) => f.category === 'hospital'),
      pharmacies: facilities.filter((f) => f.category === 'pharmacy'),
      policeStations: facilities.filter((f) => f.category === 'police'),
    };

    // 5. SECTION 5: EVIDENCE AND SOURCE LINKS (Expandable catalog)
    const evidenceAndSources = evidenceItems.map((item) => ({
      id: item.id,
      title: item.title,
      snippet: item.snippet,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName || 'Verified Ingestion',
      category: item.category,
      categoryDisplayName: CATEGORY_DISPLAY_NAMES[item.category] || item.category,
      sourceType: item.sourceType, // 'official' | 'media' | 'unverified'
      publishedDate: item.publishedDate,
      isOutdated: item.isOutdated,
      isUndated: item.isUndated,
      retrievedAt: item.retrievedAt,
    }));

    // 6. SECTION 6: MISSING INFORMATION
    const missingInformation = {
      uninvestigatedCategories: awarenessIndex.methodology.missingCategories,
      unverifiedCategories: awarenessIndex.methodology.unverifiedCategories,
      telemetryDeficits: [
        ...(awarenessIndex.methodology.missingCategories.length > 0
          ? [
              `Missing verified records for ${awarenessIndex.methodology.missingCategories
                .map((c) => c.displayName)
                .join(', ')}.`,
            ]
          : []),
        ...(facilities.length === 0
          ? ['No verified Google Maps emergency facilities (hospitals/police) were retrieved for this query.']
          : []),
        ...(outdatedItems.length > 0
          ? [`${outdatedItems.length} evidence records lack recent (within 180 days) corroboration.`]
          : []),
      ],
      investigationCompletenessScore: awarenessIndex.breakdown.informationCompletenessScore,
    };

    // 7. SECTION 7: RECOMMENDED NEXT CHECKS
    const recommendedNextChecks = [
      ...personaConfig.recommendedChecks.map((text, idx) => ({
        id: `rec-persona-${idx + 1}`,
        category: 'Personalized Profile',
        targetPersona: personaConfig.title,
        priority: 'High',
        action: text,
      })),
      ...awarenessIndex.methodology.missingCategories.map((missing, idx) => ({
        id: `rec-gap-${idx + 1}`,
        category: missing.displayName,
        targetPersona: 'All Travellers',
        priority: 'Critical',
        action: `Execute targeted live search for verified ${missing.displayName.toLowerCase()} before departing.`,
      })),
    ];

    return {
      destination,
      travellerType: personaConfig.title,
      personaKey,
      generatedAt: new Date().toISOString(),
      sections: {
        destinationOverview,
        importantFindings,
        potentialBlindspots,
        emergencyFacilities,
        evidenceAndSources,
        missingInformation,
        recommendedNextChecks,
      },
      awarenessIndex,
    };
  }
}

module.exports = ReportPersonalizationService;
