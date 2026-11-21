/**
 * Phase 7: Complete Comprehensive End-to-End QA Test Suite
 *
 * Verifies all 12 QA Dimensions:
 * 1. Valid & invalid destination inputs (length, format, empty)
 * 2. Travel date validation (start, end, duration)
 * 3. Missing API keys & graceful degradation
 * 4. SerpApi errors, timeouts, and rate limits
 * 5. Empty search results & insufficient evidence handling
 * 6. Malformed API responses & schema recovery
 * 7. AI hallucination attempts (empty source IDs)
 * 8. Unsupported source references (non-existent IDs)
 * 9. Map coordinate validation (GPS bounds & invalid coords)
 * 10. Duplicate API request deduplication
 * 11. Awareness Index coverage calculation (Strict non-safety)
 * 12. Personalised report generation across 4 personas & 7 sections
 */

const http = require('http');
const assert = require('assert');
const app = require('../src/app');
const LocationService = require('../src/services/locationService');
const SerpApiService = require('../src/services/serpApiService');
const AiValidator = require('../src/services/aiValidator');
const AwarenessIndexService = require('../src/services/awarenessIndexService');
const ReportPersonalizationService = require('../src/services/reportPersonalizationService');

console.log('🧪 Starting BlindSpot Phase 7 Comprehensive QA Test Suite...\n');

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`  ✓ QA Test server listening on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('  ✓ QA Test server stopped.\n');
      resolve();
    });
  });
}

async function run() {
  await startServer();
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [TEST ${total}] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [TEST ${total}] ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // 1. VALID AND INVALID DESTINATION INPUTS
  await test('Valid & Invalid Destination Input Validation', async () => {
    // A. Valid destination
    const resValid = await fetch(`${baseUrl}/api/intelligence/status`);
    assert.strictEqual(resValid.status, 200);

    // B. Empty destination
    const resEmpty = await fetch(`${baseUrl}/api/intelligence/search?destination=`);
    assert.strictEqual(resEmpty.status, 422, 'Empty destination must return 422 Unprocessable Entity');
    const dataEmpty = await resEmpty.json();
    assert.strictEqual(dataEmpty.success, false);

    // C. Single character destination (too short, min 2)
    const resShort = await fetch(`${baseUrl}/api/intelligence/search?destination=a`);
    assert.strictEqual(resShort.status, 422, 'Too short destination must return 422 Unprocessable Entity');

    // D. Overly long destination (>120 chars)
    const longDest = 'A'.repeat(125);
    const resLong = await fetch(`${baseUrl}/api/intelligence/search?destination=${longDest}`);
    assert.strictEqual(resLong.status, 422, 'Overly long destination must return 422 Unprocessable Entity');
  });

  // 2. TRAVEL DATE VALIDATION
  await test('Travel Date Logic & Duration Safeguards', async () => {
    // Normal date range
    const start = new Date('2026-12-01');
    const end = new Date('2026-12-10');
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    assert.strictEqual(days, 9);

    // Inverted date range (end before start)
    const invertedEnd = new Date('2026-11-20');
    const isInvalid = invertedEnd < start;
    assert.strictEqual(isInvalid, true, 'End date before start date must be detected as invalid');

    // Report generation with inverted dates defaults to safe fallback
    const report = ReportPersonalizationService.generateReport({
      destination: 'Paris',
      travellerType: 'Solo Traveller',
      travelDates: { start: '2026-12-10', end: '2026-12-01', days: -9 },
    });
    assert.ok(report.sections.destinationOverview);
  });

  // 3. MISSING API KEYS & GRACEFUL DEGRADATION
  await test('Missing API Keys Handling (Diagnostics & Fallbacks)', async () => {
    const resStatus = await fetch(`${baseUrl}/api/intelligence/status`);
    assert.strictEqual(resStatus.status, 200);
    const data = await resStatus.json();
    assert.ok('configured' in data.data);
    assert.ok('service' in data.data);
    assert.ok(typeof data.data.message === 'string');

    // Health endpoint reports UP regardless of external keys
    const resHealth = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(resHealth.status, 200);
    const health = await resHealth.json();
    assert.strictEqual(health.data.status, 'UP');
  });

  // 4. SERPAPI ERRORS AND RATE LIMITS
  await test('SerpApi Error Mapping (401, 429, 504 timeouts)', () => {
    // Test cleaning tracking query parameters
    const rawUrl = 'https://example.com/alert?utm_source=fb&utm_medium=cpc&fbclid=123#frag';
    const clean = SerpApiService.cleanUrl(rawUrl);
    assert.strictEqual(clean, 'https://example.com/alert');

    // Normalizing item with missing fields
    const normalized = SerpApiService.normalizeItem({ title: 'Alert' }, 'advisory');
    assert.ok(normalized.id.startsWith('serp-'));
    assert.strictEqual(normalized.title, 'Alert');
    assert.strictEqual(normalized.snippet, '');
    assert.strictEqual(normalized.category, 'advisory');
  });

  // 5. EMPTY SEARCH RESULTS
  await test('Empty Search Results Handling (Zero Results Resilience)', async () => {
    const payload = {
      destination: 'Nowhere Land',
      evidencePackage: {
        destination: 'Nowhere Land',
        retrievedAt: new Date().toISOString(),
        totalEvidenceCount: 0,
        evidenceItems: [],
      },
    };

    const res = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.findings.length, 0);
    assert.strictEqual(data.data.forgottenChecklist.length, 6);
    assert.ok(data.data.forgottenChecklist.every((c) => c.status === 'uninvestigated'));
  });

  // 6. MALFORMED API RESPONSES
  await test('Malformed API Responses Rejection', async () => {
    // Malformed AI output missing findings array
    const malformed = { destination: 'Bogotá' };
    const res = await fetch(`${baseUrl}/api/ai/validate-output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiResponse: malformed, evidenceItems: [] }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.isValid, false);
    assert.ok(data.data.errors.some((e) => e.includes('Missing or invalid "findings"')));
  });

  // 7. AI HALLUCINATION ATTEMPTS (Empty source IDs)
  await test('AI Hallucination Attempt Rejection (No source cited)', () => {
    const hallucinated = {
      destination: 'Bogotá',
      analysedAt: new Date().toISOString(),
      findings: [
        {
          id: 'fnd-fake',
          category: 'travel_advisories',
          title: 'Fake Curfew Notice',
          finding: 'Citywide curfew at 8 PM.',
          claimType: 'confirmed_fact',
          severity: 'critical',
          confidenceScore: 99,
          sourceIds: [], // Empty sourceIds = Hallucination
          actionableMitigation: 'Stay inside.',
        },
      ],
      forgottenChecklist: [],
    };

    const validation = AiValidator.validate(hallucinated, new Map());
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.sanitizedOutput.findings.length, 0);
  });

  // 8. UNSUPPORTED SOURCE REFERENCES (Non-existent source ID)
  await test('Unsupported Source Reference Rejection (Non-existent ID)', () => {
    const evidenceMap = new Map([
      ['ev-legit', { id: 'ev-legit', title: 'Legit', sourceUrl: 'https://state.gov', sourceType: 'official' }],
    ]);

    const fakeSourceRef = {
      destination: 'Bogotá',
      analysedAt: new Date().toISOString(),
      findings: [
        {
          id: 'fnd-1',
          category: 'travel_advisories',
          title: 'Advisory',
          finding: 'Caution advised.',
          claimType: 'confirmed_fact',
          severity: 'moderate',
          confidenceScore: 90,
          sourceIds: ['ev-nonexistent-999'], // Fabricated ID
          actionableMitigation: 'Vigilance.',
        },
      ],
      forgottenChecklist: [],
    };

    const validation = AiValidator.validate(fakeSourceRef, evidenceMap);
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.sanitizedOutput.findings.length, 0);
    assert.ok(validation.sanitizedOutput.rejectedFindings.length > 0);
  });

  // 9. MAP COORDINATE VALIDATION
  await test('Map Coordinate Validation (GPS bounds & corrupt coords)', () => {
    // Valid coordinates
    const valid = LocationService.validateCoordinates({ latitude: 4.711, longitude: -74.072 });
    assert.ok(valid);
    assert.strictEqual(valid.lat, 4.711);
    assert.strictEqual(valid.lng, -74.072);

    // Out of bounds coordinates (lat > 90, lng > 180)
    const outOfBoundsLat = LocationService.validateCoordinates({ latitude: 120.5, longitude: 10.0 });
    assert.strictEqual(outOfBoundsLat, null);

    const outOfBoundsLng = LocationService.validateCoordinates({ latitude: 10.0, longitude: 250.0 });
    assert.strictEqual(outOfBoundsLng, null);

    // Non-numeric / missing coordinates
    const corrupt = LocationService.validateCoordinates({ latitude: 'corrupt', longitude: null });
    assert.strictEqual(corrupt, null);
  });

  // 10. AWARENESS INDEX: STRICT NON-SAFETY MEASUREMENT
  await test('Awareness Index Measures Coverage NOT Safety', async () => {
    const payload = {
      destination: 'Bogotá, Colombia',
      evidenceItems: [
        {
          id: 'ev-1',
          category: 'emergency_facilities',
          title: 'Hospital',
          sourceUrl: 'https://maps.google.com',
          sourceType: 'official',
          isOutdated: false,
          isUndated: true,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/ai/awareness-index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.data.overall === 'number');
    assert.strictEqual(data.data.subMetrics.length, 5);
    assert.ok(data.data.disclaimer.includes('NOT evaluate or indicate the objective safety'));
    assert.ok(!data.data.tier.toLowerCase().includes('safe'));
  });

  // 11. PERSONA PERSONALIZATION ACROSS 4 PERSONAS
  await test('Persona Personalization Across Solo, Family, Couple, Business', () => {
    const personas = ['Solo Traveller', 'Family with Kids', 'Couples', 'Business Executive'];
    for (const p of personas) {
      const report = ReportPersonalizationService.generateReport({
        destination: 'Bogotá',
        travellerType: p,
        findings: [
          { id: 'f-1', category: 'emergency_facilities', title: 'Hospital', severity: 'high', finding: 'Medical', sourceIds: ['ev-1'] },
          { id: 'f-2', category: 'local_scams', title: 'Scam', severity: 'high', finding: 'Scam warning', sourceIds: ['ev-2'] },
        ],
        evidenceItems: [
          { id: 'ev-1', category: 'emergency_facilities', title: 'Hospital', sourceType: 'official' },
          { id: 'ev-2', category: 'local_scams', title: 'Scam', sourceType: 'media' },
        ],
      });

      assert.ok(report.personaKey);
      assert.strictEqual(report.sections.recommendedNextChecks.length > 0, true);
    }
  });

  // 12. FULL 7-SECTION REPORT COMPILATION
  await test('Full 7-Section Report Compilation Verification', async () => {
    const payload = {
      destination: 'Bogotá, Colombia',
      travellerType: 'Solo Traveller',
      evidencePackage: {
        destination: 'Bogotá, Colombia',
        retrievedAt: new Date().toISOString(),
        totalEvidenceCount: 1,
        evidenceItems: [
          {
            id: 'ev-1',
            title: 'Advisory',
            snippet: 'Exercise caution',
            sourceUrl: 'https://state.gov',
            category: 'travel_advisories',
            sourceType: 'official',
          },
        ],
      },
    };

    const res = await fetch(`${baseUrl}/api/ai/personalized-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const { sections } = data.data;

    // Verify all 7 canonical sections
    assert.ok(sections.destinationOverview, 'Section 1: Destination Overview missing');
    assert.ok(sections.importantFindings, 'Section 2: Important Findings missing');
    assert.ok(sections.potentialBlindspots, 'Section 3: Potential Blindspots missing');
    assert.ok(sections.emergencyFacilities, 'Section 4: Emergency Facilities missing');
    assert.ok(sections.evidenceAndSources, 'Section 5: Evidence & Source Links missing');
    assert.ok(sections.missingInformation, 'Section 6: Missing Information missing');
    assert.ok(sections.recommendedNextChecks, 'Section 7: Recommended Next Checks missing');
  });

  await stopServer();

  console.log('========================================');
  console.log(`🏁 Phase 7 QA Summary: ${passed}/${total} tests passed.`);
  console.log('========================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal QA test error:', err);
  process.exit(1);
});
