/**
 * Endpoint Integration Tests for BlindSpot AI Engine:
 * - GET  /api/ai/forgotten-checklist
 * - POST /api/ai/analyze
 * - POST /api/ai/validate-output
 */

const http = require('http');
const assert = require('assert');
const app = require('../src/app');

console.log('🧪 Starting BlindSpot AI Endpoint Integration Tests...\n');

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`  ✓ Test server listening on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('  ✓ Test server stopped.\n');
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
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // TEST 1: Health Check Endpoint
  await test('GET /api/health returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'UP');
  });

  // TEST 2: Validate Output Endpoint - Catches Hallucinations
  await test('POST /api/ai/validate-output catches hallucinated claims', async () => {
    const payload = {
      aiResponse: {
        destination: 'Bogotá',
        analysedAt: new Date().toISOString(),
        findings: [
          {
            id: 'fnd-1',
            category: 'travel_advisories',
            title: 'Unverified Warning',
            finding: 'Fabricated warning without valid citation.',
            claimType: 'confirmed_fact',
            severity: 'high',
            confidenceScore: 90,
            sourceIds: ['invalid-source-999'], // Non-existent source ID
            actionableMitigation: 'None',
          },
        ],
        forgottenChecklist: [],
      },
      evidenceItems: [
        {
          id: 'ev-real-1',
          title: 'Official State Advisory',
          snippet: 'Exercise increased caution.',
          sourceUrl: 'https://state.gov',
          sourceType: 'official',
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/ai/validate-output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.isValid, false, 'Validation should fail for non-existent source ID');
    assert.ok(
      data.data.errors.some((e) => e.includes('nonexistent') || e.includes('hallucinated')),
      'Error message must state source ID is nonexistent or hallucinated'
    );
  });

  // TEST 3: Validate Output Endpoint - Passes Grounded Findings
  await test('POST /api/ai/validate-output passes strictly grounded findings', async () => {
    const payload = {
      aiResponse: {
        destination: 'Bogotá',
        analysedAt: new Date().toISOString(),
        findings: [
          {
            id: 'fnd-1',
            category: 'travel_advisories',
            title: 'US State Dept Advisory',
            finding: 'Exercise increased caution due to civil unrest and petty crime.',
            claimType: 'confirmed_fact',
            severity: 'moderate',
            confidenceScore: 95,
            sourceIds: ['ev-real-1'],
            actionableMitigation: 'Avoid protests and adhere to local municipal guidance.',
          },
        ],
        forgottenChecklist: [
          {
            category: 'travel_advisories',
            displayName: 'Official Travel Advisories',
            status: 'adequately_checked',
            evidenceCount: 1,
            gapAnalysis: 'Advisory verified.',
            recommendedAction: 'Maintain vigilance.',
          },
          {
            category: 'transport_disruptions',
            displayName: 'Transport & Transit Disruptions',
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'Zero records.',
            recommendedAction: 'Check transit.',
          },
          {
            category: 'weather_concerns',
            displayName: 'Weather & Climate Risks',
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'Zero records.',
            recommendedAction: 'Check weather.',
          },
          {
            category: 'local_scams',
            displayName: 'Local Concerns & Reported Scams',
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'Zero records.',
            recommendedAction: 'Check scams.',
          },
          {
            category: 'emergency_facilities',
            displayName: 'Emergency Facility Availability',
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'Zero records.',
            recommendedAction: 'Check facilities.',
          },
          {
            category: 'other_considerations',
            displayName: 'Overlooked Cultural & Legal Considerations',
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'Zero records.',
            recommendedAction: 'Check considerations.',
          },
        ],
      },
      evidenceItems: [
        {
          id: 'ev-real-1',
          title: 'US State Dept Advisory Colombia',
          snippet: 'Exercise increased caution due to civil unrest and petty crime.',
          sourceUrl: 'https://travel.state.gov',
          sourceType: 'official',
          isOutdated: false,
          isUndated: false,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/ai/validate-output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.isValid, true, 'Validation must pass for grounded findings');
    assert.strictEqual(data.data.sanitizedOutput.findings.length, 1);
  });

  // TEST 4: Analyze Destination with Structured Evidence Package
  await test('POST /api/ai/analyze returns grounded findings and Forgotten Checklist', async () => {
    const payload = {
      destination: 'Bogotá, Colombia',
      evidencePackage: {
        destination: 'Bogotá, Colombia',
        retrievedAt: new Date().toISOString(),
        totalEvidenceCount: 2,
        evidenceItems: [
          {
            id: 'ev-1',
            title: 'Official Advisory: Safe Transit Corridors',
            snippet: 'Use registered radio taxis or app-based hailing.',
            sourceUrl: 'https://travel.state.gov/colombia',
            sourceName: 'US Department of State',
            category: 'travel_advisories',
            sourceType: 'official',
            isOutdated: false,
            isUndated: false,
          },
          {
            id: 'ev-2',
            title: 'Police Station CAI Chapinero',
            snippet: 'Verified facility: CAI Chapinero. Address: Carrera 7 #53. Open 24h.',
            sourceUrl: 'https://maps.google.com',
            sourceName: 'Google Maps Place Registry',
            category: 'emergency_facilities',
            facilityType: 'police',
            sourceType: 'official',
            isOutdated: false,
            isUndated: false,
          },
        ],
      },
    };

    const res = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.findings.length > 0, 'Should synthesize grounded findings');
    assert.strictEqual(data.data.forgottenChecklist.length, 6, 'Checklist must cover all 6 dimensions');
    assert.ok(data.data.evidenceCatalog.length === 2, 'Evidence catalog must be preserved');
  });

  // TEST 5: Insufficient Evidence Handling
  await test('POST /api/ai/analyze returns explicit empty/insufficient message when evidence is empty', async () => {
    const payload = {
      destination: 'Unknown Destination',
      evidencePackage: {
        destination: 'Unknown Destination',
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
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.findings.length, 0, 'No findings generated without evidence');
    assert.ok(
      data.data.forgottenChecklist.every((c) => c.status === 'uninvestigated'),
      'All 6 checklist items must be marked uninvestigated'
    );
  });

  // TEST 6: POST /api/ai/awareness-index
  await test('POST /api/ai/awareness-index returns 5 pillars and non-safety disclaimer', async () => {
    const payload = {
      destination: 'Bogotá, Colombia',
      evidenceItems: [
        {
          id: 'ev-1',
          title: 'Advisory 1',
          snippet: 'Exercise caution',
          sourceUrl: 'https://state.gov',
          category: 'travel_advisories',
          sourceType: 'official',
          isOutdated: false,
          isUndated: false,
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
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.data.overall === 'number');
    assert.strictEqual(data.data.subMetrics.length, 5);
    assert.ok(data.data.disclaimer.includes('NOT evaluate or indicate the objective safety'));
  });

  // TEST 7: POST /api/ai/personalized-report
  await test('POST /api/ai/personalized-report returns 7 canonical sections tailored for persona', async () => {
    const payload = {
      destination: 'Bogotá, Colombia',
      travellerType: 'Family with Children',
      evidencePackage: {
        destination: 'Bogotá, Colombia',
        retrievedAt: new Date().toISOString(),
        totalEvidenceCount: 2,
        evidenceItems: [
          {
            id: 'ev-1',
            title: 'Pediatric Clinic',
            snippet: 'Pediatric ER in Chapinero.',
            sourceUrl: 'https://maps.google.com',
            category: 'emergency_facilities',
            sourceType: 'official',
            isOutdated: false,
            isUndated: false,
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
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.personaKey, 'family');
    const { sections } = data.data;
    assert.ok(sections.destinationOverview);
    assert.ok(Array.isArray(sections.importantFindings));
    assert.ok(Array.isArray(sections.potentialBlindspots));
    assert.ok(sections.emergencyFacilities);
    assert.ok(Array.isArray(sections.evidenceAndSources));
    assert.ok(sections.missingInformation);
    assert.ok(Array.isArray(sections.recommendedNextChecks));
  });

  await stopServer();

  console.log('========================================');
  console.log(`🏁 Endpoint Test Summary: ${passed}/${total} tests passed.`);
  console.log('========================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
