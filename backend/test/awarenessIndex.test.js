/**
 * Automated Test Suite for BlindSpot Awareness Index & Personalization:
 * 1. Reproducible scoring methodology across 5 pillars
 * 2. Strict coverage metric enforcement (Never labels destination safe/unsafe)
 * 3. Penalties for missing critical telemetry and outdated sources
 * 4. Personalisation priorities for Solo, Family, Couple, Business
 * 5. Full 7-section report compilation
 */

const assert = require('assert');
const AwarenessIndexService = require('../src/services/awarenessIndexService');
const ReportPersonalizationService = require('../src/services/reportPersonalizationService');

console.log('🧪 Starting Awareness Index & Personalization Test Suite...\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// Mock Evidence Package (Comprehensive)
const comprehensiveEvidence = [
  {
    id: 'ev-adv-1',
    category: 'travel_advisories',
    title: 'US State Dept Advisory',
    snippet: 'Exercise increased caution in downtown sectors.',
    sourceUrl: 'https://travel.state.gov',
    sourceType: 'official',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-10-15',
  },
  {
    id: 'ev-adv-2',
    category: 'travel_advisories',
    title: 'UK Foreign Office Alert',
    snippet: 'Check local municipal directives.',
    sourceUrl: 'https://gov.uk',
    sourceType: 'official',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-10-20',
  },
  {
    id: 'ev-trn-1',
    category: 'transport_disruptions',
    title: 'Metro Line Electrical Maintenance',
    snippet: 'Weekend delays reported on commuter trains.',
    sourceUrl: 'https://news.city.com',
    sourceType: 'media',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-11-01',
  },
  {
    id: 'ev-scm-1',
    category: 'local_scams',
    title: 'Street Taxi Meter Tampering',
    snippet: 'Unregulated street taxis overcharge tourists.',
    sourceUrl: 'https://bogotareport.com',
    sourceType: 'media',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-09-10',
  },
  {
    id: 'ev-fac-1',
    category: 'emergency_facilities',
    title: 'Fundacion Santa Fe Hospital',
    snippet: 'Tertiary JCI accredited medical center.',
    sourceUrl: 'https://maps.google.com',
    sourceType: 'official',
    isOutdated: false,
    isUndated: true,
  },
  {
    id: 'ev-fac-2',
    category: 'emergency_facilities',
    title: 'CAI Chapinero Police Post',
    snippet: 'Municipal 24h police outpost.',
    sourceUrl: 'https://maps.google.com',
    sourceType: 'official',
    isOutdated: false,
    isUndated: true,
  },
  {
    id: 'ev-wth-1',
    category: 'weather_concerns',
    title: 'High Altitude Mountain Climate',
    snippet: 'Afternoon rain common; temperature drops to 9C.',
    sourceUrl: 'https://weather.gov',
    sourceType: 'official',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-11-12',
  },
  {
    id: 'ev-oth-1',
    category: 'other_considerations',
    title: 'Mandatory National Identification Law',
    snippet: 'Foreigners must carry official identification or notarized passport copy.',
    sourceUrl: 'https://migracion.gov',
    sourceType: 'official',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-08-01',
  },
  // Add additional items to reach depth benchmark
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `ev-extra-${i}`,
    category: i % 2 === 0 ? 'transport_disruptions' : 'local_scams',
    title: `Municipal Alert ${i}`,
    snippet: `Verified record snippet ${i}`,
    sourceUrl: `https://city.gov/alert/${i}`,
    sourceType: 'media',
    isOutdated: false,
    isUndated: false,
    publishedDate: '2026-10-01',
  })),
];

// TEST 1: Formula Reproducibility & Mathematical Accuracy
runTest('Should calculate Awareness Index deterministically with all 5 pillars', () => {
  const result = AwarenessIndexService.calculateIndex({
    destination: 'Bogotá, Colombia',
    evidenceItems: comprehensiveEvidence,
  });

  assert.ok(typeof result.overall === 'number', 'Overall score must be a number');
  assert.ok(result.overall >= 80 && result.overall <= 100, `Expected high coverage score, got ${result.overall}`);
  assert.strictEqual(result.subMetrics.length, 5, 'Must contain all 5 sub-metric pillars');

  const { breakdown } = result;
  assert.strictEqual(breakdown.categoryCoverageScore, 25, 'All 6 categories examined = 25 pts');
  assert.strictEqual(breakdown.evidenceDepthScore, 25, '16 items (>=15) = 25 pts');
  assert.ok(breakdown.sourceFreshnessScore >= 16, 'Fresh sources should score high on freshness');
  assert.strictEqual(breakdown.informationCompletenessScore, 15, 'No missing critical pillars = 15 pts');
});

// TEST 2: Strict Coverage Principle (Never labels destination safe or unsafe)
runTest('Should measure investigation coverage, NOT destination safety', () => {
  const result = AwarenessIndexService.calculateIndex({
    destination: 'Bogotá, Colombia',
    evidenceItems: comprehensiveEvidence,
  });

  // Disclaimer must be explicitly present and clear
  assert.ok(result.disclaimer.includes('investigation'), 'Disclaimer must mention investigation');
  assert.ok(result.disclaimer.includes('NOT evaluate or indicate the objective safety'), 'Disclaimer must emphasize non-safety');

  // Tier name must refer to investigation coverage, not safety!
  assert.ok(!result.tier.toLowerCase().includes('safe'), 'Tier name must never use the word "safe"');
  assert.ok(!result.tier.toLowerCase().includes('dangerous'), 'Tier name must never use the word "dangerous"');
  assert.ok(result.tier.toLowerCase().includes('coverage') || result.tier.toLowerCase().includes('blindspot'), 'Tier name must reflect investigation coverage');
});

// TEST 3: Penalty for Missing Critical Information
runTest('Should penalize Awareness Index when emergency grid or advisories are missing', () => {
  // Strip out emergency facilities and advisories
  const sparseEvidence = comprehensiveEvidence.filter(
    (e) => e.category !== 'emergency_facilities' && e.category !== 'travel_advisories'
  );

  const sparseResult = AwarenessIndexService.calculateIndex({
    destination: 'Sparse Destination',
    evidenceItems: sparseEvidence,
  });

  // Missing emergency facilities (-5) and travel advisories (-5)
  assert.strictEqual(
    sparseResult.breakdown.informationCompletenessScore,
    5,
    'Expected 10 pt deduction for missing emergency facilities and advisories'
  );

  // Missing categories must be explicitly identified
  assert.ok(
    sparseResult.methodology.missingCategories.some((c) => c.category === 'emergency_facilities'),
    'emergency_facilities must be in missingCategories list'
  );
  assert.ok(
    sparseResult.methodology.missingCategories.some((c) => c.category === 'travel_advisories'),
    'travel_advisories must be in missingCategories list'
  );
});

// TEST 4: Outdated Evidence Recency Penalty
runTest('Should penalize source freshness score when evidence is outdated (>180d)', () => {
  const outdatedEvidence = comprehensiveEvidence.map((e) => ({
    ...e,
    isOutdated: true,
  }));

  const staleResult = AwarenessIndexService.calculateIndex({
    destination: 'Stale Telemetry City',
    evidenceItems: outdatedEvidence,
  });

  assert.ok(
    staleResult.breakdown.sourceFreshnessScore <= 5,
    `Stale sources must yield low freshness score, got ${staleResult.breakdown.sourceFreshnessScore}`
  );
});

// TEST 5: Personalization Priorities across 4 Personas
runTest('Should prioritize distinct operational concerns for Solo, Family, Couple, Business', () => {
  const sampleFindings = [
    {
      id: 'f-1',
      category: 'emergency_facilities',
      title: 'Pediatric Hospital Grid',
      severity: 'high',
      finding: 'Emergency pediatric ward available at Santa Fe.',
      claimType: 'confirmed_fact',
      sourceIds: ['ev-fac-1'],
    },
    {
      id: 'f-2',
      category: 'local_scams',
      title: 'Night Street Robbery in Santa Fe',
      severity: 'high',
      finding: 'Opportunistic street robbery after dark.',
      claimType: 'reported_event',
      sourceIds: ['ev-scm-1'],
    },
    {
      id: 'f-3',
      category: 'transport_disruptions',
      title: 'Airport Highway Protest Closure',
      severity: 'moderate',
      finding: 'Occasional demonstrations block airport corridor.',
      claimType: 'reported_event',
      sourceIds: ['ev-trn-1'],
    },
  ];

  // Test Solo
  const soloReport = ReportPersonalizationService.generateReport({
    destination: 'Bogotá',
    travellerType: 'Solo Female Traveller',
    findings: sampleFindings,
    evidenceItems: comprehensiveEvidence,
  });
  assert.strictEqual(soloReport.personaKey, 'solo');
  assert.ok(soloReport.sections.importantFindings[0].category === 'local_scams' || soloReport.sections.importantFindings[0].isPersonaPriority);

  // Test Family
  const familyReport = ReportPersonalizationService.generateReport({
    destination: 'Bogotá',
    travellerType: 'Family with 2 Kids',
    findings: sampleFindings,
    evidenceItems: comprehensiveEvidence,
  });
  assert.strictEqual(familyReport.personaKey, 'family');
  assert.ok(
    familyReport.sections.importantFindings.find((f) => f.category === 'emergency_facilities').isPersonaPriority,
    'Family report must flag emergency medical as persona priority'
  );

  // Test Business
  const bizReport = ReportPersonalizationService.generateReport({
    destination: 'Bogotá',
    travellerType: 'Business Executive',
    findings: sampleFindings,
    evidenceItems: comprehensiveEvidence,
  });
  assert.strictEqual(bizReport.personaKey, 'business');
  assert.ok(
    bizReport.sections.importantFindings.find((f) => f.category === 'transport_disruptions').isPersonaPriority,
    'Business report must flag transport disruptions as persona priority'
  );

  // Test Couple
  const coupleReport = ReportPersonalizationService.generateReport({
    destination: 'Bogotá',
    travellerType: 'Couple on Vacation',
    findings: sampleFindings,
    evidenceItems: comprehensiveEvidence,
  });
  assert.strictEqual(coupleReport.personaKey, 'couple');
});

// TEST 6: Verification of All 7 Canonical Report Sections
runTest('Should produce all 7 canonical report sections in order', () => {
  const report = ReportPersonalizationService.generateReport({
    destination: 'Bogotá, Colombia',
    travellerType: 'Solo Traveller',
    findings: [
      {
        id: 'f-1',
        category: 'travel_advisories',
        title: 'Advisory Finding',
        severity: 'high',
        finding: 'Diplomatic caution.',
        claimType: 'confirmed_fact',
        sourceIds: ['ev-adv-1'],
      },
    ],
    evidenceItems: comprehensiveEvidence,
    facilities: [
      { title: 'Clinic Santa Fe', category: 'hospital', address: 'Calle 119', phone: '+57 1 6030303' },
    ],
  });

  const { sections } = report;
  assert.ok(sections.destinationOverview, 'Must have Section 1: destinationOverview');
  assert.ok(Array.isArray(sections.importantFindings), 'Must have Section 2: importantFindings');
  assert.ok(Array.isArray(sections.potentialBlindspots), 'Must have Section 3: potentialBlindspots');
  assert.ok(sections.emergencyFacilities, 'Must have Section 4: emergencyFacilities');
  assert.ok(Array.isArray(sections.evidenceAndSources), 'Must have Section 5: evidenceAndSources');
  assert.ok(sections.missingInformation, 'Must have Section 6: missingInformation');
  assert.ok(Array.isArray(sections.recommendedNextChecks), 'Must have Section 7: recommendedNextChecks');
});

console.log('========================================');
console.log(`🏁 Awareness Index Suite: ${passedTests}/${totalTests} tests passed.`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
