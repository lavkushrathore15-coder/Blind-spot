/**
 * BlindSpot Awareness Index Engine
 *
 * CRITICAL RULE:
 * The Awareness Index strictly measures INVESTIGATION COVERAGE,
 * not the objective safety of a destination.
 *
 * Scoring Methodology:
 * Total Score = Category Coverage (max 25)
 *             + Evidence Availability & Depth (max 25)
 *             + Source Freshness (max 20)
 *             + Verification Quality & Provenance (max 15)
 *             + Information Completeness (max 15)
 *             = 100 Points Maximum
 */

const { ANALYSIS_CATEGORIES, CATEGORY_DISPLAY_NAMES } = require('./aiSchema');

class AwarenessIndexService {
  /**
   * Calculates the transparent and reproducible Awareness Index
   * @param {object} params
   * @param {string} params.destination
   * @param {Array} params.evidenceItems Array of ingested evidence records
   * @param {Array} [params.forgottenChecklist] Optional checklist items
   * @returns {object} Calculated score, methodology, submetrics, and disclaimers
   */
  static calculateIndex({ destination, evidenceItems = [], forgottenChecklist = [] }) {
    const totalItems = Array.isArray(evidenceItems) ? evidenceItems.length : 0;

    // 1. Group evidence by category
    const itemsByCategory = {};
    ANALYSIS_CATEGORIES.forEach((cat) => {
      itemsByCategory[cat] = [];
    });

    let currentSourcesCount = 0;
    let outdatedSourcesCount = 0;
    let undatedSourcesCount = 0;

    let officialCount = 0;
    let mediaCount = 0;
    let unverifiedCount = 0;

    if (totalItems > 0) {
      for (const item of evidenceItems) {
        const cat = item.category || 'other_considerations';
        if (itemsByCategory[cat]) {
          itemsByCategory[cat].push(item);
        } else {
          itemsByCategory.other_considerations.push(item);
        }

        // Date Freshness
        if (item.isOutdated) {
          outdatedSourcesCount++;
        } else if (item.isUndated || !item.publishedDate) {
          undatedSourcesCount++;
        } else {
          currentSourcesCount++;
        }

        // Source Type
        if (item.sourceType === 'official') {
          officialCount++;
        } else if (item.sourceType === 'media') {
          mediaCount++;
        } else {
          unverifiedCount++;
        }
      }
    }

    // --- PILLAR 1: CATEGORIES INVESTIGATED (Max 25 pts) ---
    // How many of the 6 core analysis categories have >= 1 verified record
    const investigatedCategories = ANALYSIS_CATEGORIES.filter(
      (cat) => itemsByCategory[cat].length > 0
    );
    const missingCategories = ANALYSIS_CATEGORIES.filter(
      (cat) => itemsByCategory[cat].length === 0
    );
    const categoryCoverageScore = Math.round(
      (investigatedCategories.length / ANALYSIS_CATEGORIES.length) * 25
    );

    // --- PILLAR 2: EVIDENCE AVAILABILITY & DEPTH (Max 25 pts) ---
    // Scaled against a benchmark of 15+ verified items
    // Min 0, Max 25
    const evidenceDepthScore = Math.min(25, Math.round((totalItems / 15) * 25));

    // --- PILLAR 3: SOURCE FRESHNESS (Max 20 pts) ---
    // Current (<180d) = 1.0 weight, Undated = 0.6 weight, Outdated (>180d) = 0.2 weight
    let sourceFreshnessScore = 0;
    let freshnessRatio = 0;
    if (totalItems > 0) {
      freshnessRatio =
        (currentSourcesCount * 1.0 + undatedSourcesCount * 0.6 + outdatedSourcesCount * 0.2) /
        totalItems;
      sourceFreshnessScore = Math.min(20, Math.round(freshnessRatio * 20));
    }

    // --- PILLAR 4: VERIFICATION QUALITY & PROVENANCE (Max 15 pts) ---
    // Official presence: 8 pts
    // Media presence: 4 pts
    // Unverified claims ratio: +3 pts if <= 30% unverified, else 0 pts
    let verificationQualityScore = 0;
    if (totalItems > 0) {
      if (officialCount > 0) verificationQualityScore += 8;
      if (mediaCount > 0) verificationQualityScore += 4;
      const unverifiedRatio = unverifiedCount / totalItems;
      if (unverifiedRatio <= 0.3) {
        verificationQualityScore += 3;
      } else if (unverifiedRatio <= 0.6) {
        verificationQualityScore += 1;
      }
      verificationQualityScore = Math.min(15, verificationQualityScore);
    }

    // --- PILLAR 5: INFORMATION COMPLETENESS (Max 15 pts) ---
    // Starts at 15 pts. Critical telemetry deductions:
    // Missing Emergency Facilities: -5 pts
    // Missing Official Travel Advisories: -5 pts
    // Missing Transport Disruptions: -3 pts
    // Missing Local Scams/Concerns: -2 pts
    let informationCompletenessScore = 15;
    if (itemsByCategory.emergency_facilities.length === 0) {
      informationCompletenessScore -= 5;
    }
    if (itemsByCategory.travel_advisories.length === 0) {
      informationCompletenessScore -= 5;
    }
    if (itemsByCategory.transport_disruptions.length === 0) {
      informationCompletenessScore -= 3;
    }
    if (itemsByCategory.local_scams.length === 0) {
      informationCompletenessScore -= 2;
    }
    informationCompletenessScore = Math.max(0, informationCompletenessScore);

    // --- COMPOSITE TOTAL ---
    const overallScore = Math.max(
      0,
      Math.min(
        100,
        categoryCoverageScore +
          evidenceDepthScore +
          sourceFreshnessScore +
          verificationQualityScore +
          informationCompletenessScore
      )
    );

    // Tier Classification (Strictly about investigation coverage, NOT safety!)
    let tier = 'Critical Telemetry BlindSpot';
    let grade = 'D';
    let summaryText =
      'Investigation coverage is sparse or incomplete. Major blindspots exist across core safety and logistical dimensions.';

    if (overallScore >= 85) {
      tier = 'Comprehensive Investigation Coverage';
      grade = 'A';
      summaryText =
        'Extensive multilateral investigation coverage achieved. Factual citations are dense, fresh, and backed by official registries with minimal unknown blindspots.';
    } else if (overallScore >= 70) {
      tier = 'Substantial Investigation Coverage';
      grade = 'B';
      summaryText =
        'Substantial baseline investigation coverage. Primary logistical and security pillars have verified telemetry, with minor supplementary gaps remaining.';
    } else if (overallScore >= 50) {
      tier = 'Partial / Moderate Investigation Coverage';
      grade = 'C';
      summaryText =
        'Moderate investigation coverage. Several key dimensions have been explored, but significant blindspots or uncorroborated evidence remain.';
    }

    // Identify unverified categories
    const unverifiedCategories = [];
    ANALYSIS_CATEGORIES.forEach((cat) => {
      const catItems = itemsByCategory[cat];
      if (catItems.length > 0 && catItems.every((item) => item.sourceType === 'unverified')) {
        unverifiedCategories.push({
          category: cat,
          displayName: CATEGORY_DISPLAY_NAMES[cat],
          reason: 'All ingested evidence for this category relies on unverified community claims.',
        });
      }
    });

    return {
      destination,
      overall: overallScore,
      tier,
      grade,
      evaluatedAt: new Date().toISOString(),
      disclaimer:
        'IMPORTANT: The BlindSpot Awareness Index measures the thoroughness of the investigation and the depth of verified evidence gathered. It does NOT evaluate or indicate the objective safety of the destination. A destination with a high score has been thoroughly investigated; a low score indicates significant intelligence blindspots remaining.',
      summaryText,
      subMetrics: [
        {
          key: 'category_coverage',
          label: 'Categories Investigated',
          score: categoryCoverageScore,
          maxScore: 25,
          percentage: Math.round((categoryCoverageScore / 25) * 100),
          status:
            categoryCoverageScore >= 20 ? 'Optimal' : categoryCoverageScore >= 12 ? 'Partial' : 'Deficient',
          detail: `${investigatedCategories.length} of ${ANALYSIS_CATEGORIES.length} dimensions examined`,
          advice:
            missingCategories.length > 0
              ? `Uninvestigated: ${missingCategories.map((c) => CATEGORY_DISPLAY_NAMES[c]).join(', ')}`
              : 'All 6 core investigation dimensions possess verified evidence.',
        },
        {
          key: 'evidence_depth',
          label: 'Evidence Availability & Depth',
          score: evidenceDepthScore,
          maxScore: 25,
          percentage: Math.round((evidenceDepthScore / 25) * 100),
          status: evidenceDepthScore >= 20 ? 'Dense' : evidenceDepthScore >= 12 ? 'Adequate' : 'Sparse',
          detail: `${totalItems} total verified source items ingested`,
          advice:
            totalItems >= 15
              ? 'Telemetry volume meets high-confidence benchmark (15+ records).'
              : `Ingest ${15 - totalItems} more verified sources to reach comprehensive depth.`,
        },
        {
          key: 'source_freshness',
          label: 'Source Freshness & Currency',
          score: sourceFreshnessScore,
          maxScore: 20,
          percentage: Math.round((sourceFreshnessScore / 20) * 100),
          status: sourceFreshnessScore >= 15 ? 'Fresh' : sourceFreshnessScore >= 10 ? 'Acceptable' : 'Stale',
          detail: `${currentSourcesCount} current (<180d), ${undatedSourcesCount} undated, ${outdatedSourcesCount} outdated (>180d)`,
          advice:
            outdatedSourcesCount > 0
              ? `${outdatedSourcesCount} sources exceed 180 days; review for recent on-the-ground developments.`
              : 'Telemetry is current with recent publication timestamps.',
        },
        {
          key: 'verification_quality',
          label: 'Verification & Provenance Quality',
          score: verificationQualityScore,
          maxScore: 15,
          percentage: Math.round((verificationQualityScore / 15) * 100),
          status:
            verificationQualityScore >= 12 ? 'High Provenance' : verificationQualityScore >= 8 ? 'Moderate' : 'Low Provenance',
          detail: `${officialCount} official, ${mediaCount} media, ${unverifiedCount} community records`,
          advice:
            officialCount > 0
              ? 'Anchored by official diplomatic or municipal registry data.'
              : 'Requires cross-referencing with official government or consular portals.',
        },
        {
          key: 'information_completeness',
          label: 'Critical Information Completeness',
          score: informationCompletenessScore,
          maxScore: 15,
          percentage: Math.round((informationCompletenessScore / 15) * 100),
          status:
            informationCompletenessScore >= 12 ? 'Complete' : informationCompletenessScore >= 8 ? 'Gaps Present' : 'Major Gaps',
          detail: `${15 - informationCompletenessScore} penalty points for missing core pillars`,
          advice:
            itemsByCategory.emergency_facilities.length === 0
              ? 'CRITICAL GAP: Missing physical emergency facility coordinates (hospitals/police).'
              : itemsByCategory.travel_advisories.length === 0
              ? 'CRITICAL GAP: Missing official consular travel advisory.'
              : 'Essential emergency, advisory, transit, and scam pillars are present.',
        },
      ],
      breakdown: {
        categoryCoverageScore,
        evidenceDepthScore,
        sourceFreshnessScore,
        verificationQualityScore,
        informationCompletenessScore,
      },
      methodology: {
        formula:
          'Awareness Index = Category Coverage (25) + Evidence Depth (25) + Source Freshness (20) + Verification Quality (15) + Information Completeness (15)',
        categoriesInvestigatedCount: investigatedCategories.length,
        totalCategoriesCount: ANALYSIS_CATEGORIES.length,
        totalEvidenceItems: totalItems,
        freshnessMetrics: {
          currentSourcesCount,
          outdatedSourcesCount,
          undatedSourcesCount,
        },
        provenanceMetrics: {
          officialCount,
          mediaCount,
          unverifiedCount,
        },
        missingCategories: missingCategories.map((c) => ({
          category: c,
          displayName: CATEGORY_DISPLAY_NAMES[c],
        })),
        unverifiedCategories,
      },
    };
  }
}

module.exports = AwarenessIndexService;
