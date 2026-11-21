/**
 * Automated Test Suite for BlindSpot AI Engine:
 * 1. Hallucinated claims (finding with no source)
 * 2. Invalid source IDs (finding referencing IDs not in evidence set)
 * 3. Malformed AI responses (invalid schema, missing required fields)
 * 4. Insufficient evidence handling (Forgotten Checklist coverage)
 * 5. Valid grounded evidence verification
 */

const assert = require('assert');
const AiValidator = require('../src/services/aiValidator');
const AiEngineService = require('../src/services/aiEngineService');

console.log('🧪 Starting BlindSpot AI Engine Test Suite...\n');

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

// Mock Evidence Package
const mockEvidenceMap = new Map([
  [
    'ev-1',
    {
      id: 'ev-1',
      title: 'US Embassy Travel Warning: Night Taxi Risks',
      snippet: 'Exercise caution with unauthorized yellow cabs after dark.',
      sourceUrl: 'https://travel.state.gov/colombia',
      sourceType: 'official',
      isOutdated: false,
      isUndated: false,
    },
  ],
  [
    'ev-2',
    {
      id: 'ev-2',
      title: 'Local Press: Transit Line 1 Service Halts',
      snippet: 'Metro Line 1 experiences intermittent electrical halts.',
      sourceUrl: 'https://news.bogota.gov/transit',
      sourceType: 'media',
      isOutdated: false,
      isUndated: false,
    },
  ],
]);

// TEST 1: Hallucinated Claim (No source IDs provided)
runTest('Should REJECT hallucinated claim with empty sourceIds', () => {
  const hallucinatedOutput = {
    destination: 'Bogotá',
    analysedAt: new Date().toISOString(),
    findings: [
      {
        id: 'fnd-fake',
        category: 'travel_advisories',
        title: 'Fabricated Street Hazard',
        finding: 'Curfew imposed in all downtown sectors starting at 6 PM.',
        claimType: 'confirmed_fact',
        severity: 'critical',
        confidenceScore: 99,
        sourceIds: [], // Empty sourceIds = Hallucination
        actionableMitigation: 'Stay inside hotel.',
      },
    ],
    forgottenChecklist: [],
  };

  const result = AiValidator.validate(hallucinatedOutput, mockEvidenceMap);
  assert.strictEqual(result.isValid, false, 'Expected validation to fail for empty sourceIds');
  assert.ok(
    result.errors.some((e) => e.includes('Hallucinated claim detected')),
    'Expected error message referencing hallucinated claim'
  );
  assert.strictEqual(result.sanitizedOutput.findings.length, 0, 'Hallucinated finding must be rejected');
});

// TEST 2: Invalid / Nonexistent Source ID
runTest('Should REJECT finding referencing non-existent source ID', () => {
  const invalidSourceOutput = {
    destination: 'Bogotá',
    analysedAt: new Date().toISOString(),
    findings: [
      {
        id: 'fnd-rogue',
        category: 'local_scams',
        title: 'Counterfeit Currency in ATMs',
        finding: 'ATMs in Northern Bogotá distribute fake bank notes.',
        claimType: 'reported_event',
        severity: 'high',
        confidenceScore: 80,
        sourceIds: ['rogue-source-id-999'], // Non-existent in mockEvidenceMap
        actionableMitigation: 'Only use bank branch ATMs.',
      },
    ],
    forgottenChecklist: [],
  };

  const result = AiValidator.validate(invalidSourceOutput, mockEvidenceMap);
  assert.strictEqual(result.isValid, false, 'Expected validation to fail for invalid source IDs');
  assert.ok(
    result.errors.some((e) => e.includes('Referenced nonexistent/hallucinated source IDs')),
    'Expected error message identifying nonexistent source ID'
  );
  assert.strictEqual(result.sanitizedOutput.findings.length, 0, 'Finding with only invalid sources must be rejected');
});

// TEST 3: Malformed AI Responses
runTest('Should REJECT malformed AI response (Missing required top-level fields)', () => {
  const malformedInputs = [
    null,
    'Plain text instead of JSON',
    {},
    { destination: 'Paris' }, // Missing findings and checklist
    { destination: 'Paris', findings: 'Not an array', forgottenChecklist: [] },
  ];

  for (const input of malformedInputs) {
    const result = AiValidator.validate(input, mockEvidenceMap);
    assert.strictEqual(result.isValid, false, 'Expected malformed input to fail validation');
  }
});

runTest('Should REJECT finding with invalid category or claimType', () => {
  const invalidCategoryOutput = {
    destination: 'Paris',
    findings: [
      {
        id: 'fnd-bad-cat',
        category: 'unsupported_category_name',
        title: 'Invalid Category Finding',
        finding: 'Some finding text.',
        claimType: 'invalid_claim_type',
        severity: 'critical',
        sourceIds: ['ev-1'],
      },
    ],
    forgottenChecklist: [],
  };

  const result = AiValidator.validate(invalidCategoryOutput, mockEvidenceMap);
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('Invalid category')));
  assert.ok(result.errors.some((e) => e.includes('Invalid claimType')));
});

// TEST 4: Insufficient Evidence & Forgotten Checklist Handling
runTest('Should correctly flag uninvestigated categories in Forgotten Checklist', () => {
  const emptyEvidencePackage = {
    destination: 'Unknown City',
    evidenceItems: [],
    evidenceMap: new Map(),
  };

  const analysis = AiEngineService.runGroundedAnalysis('Unknown City', emptyEvidencePackage);
  const result = AiValidator.validate(analysis, emptyEvidencePackage.evidenceMap);

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.sanitizedOutput.findings.length, 0, 'Should return 0 findings for 0 evidence');

  // Verify all 6 categories are in the checklist and marked uninvestigated
  const checklist = result.sanitizedOutput.forgottenChecklist;
  assert.strictEqual(checklist.length, 6, 'Forgotten Checklist must evaluate all 6 categories');
  assert.ok(
    checklist.every((c) => c.status === 'uninvestigated'),
    'All categories must be flagged as uninvestigated when evidence is empty'
  );
  assert.ok(
    checklist.some((c) => c.category === 'emergency_facilities' && c.gapAnalysis.includes('CRITICAL BLINDSPOT'))
  );
});

// TEST 5: Valid Grounded Findings Pass Cleanly
runTest('Should PASS valid grounded finding referencing actual source ID', () => {
  const validOutput = {
    destination: 'Bogotá',
    analysedAt: new Date().toISOString(),
    findings: [
      {
        id: 'fnd-valid-1',
        category: 'travel_advisories',
        title: 'Night Street Taxi Caution',
        finding: 'Consular bulletins advise utilizing verified rideshare rather than hailing yellow cabs after dark.',
        claimType: 'confirmed_fact',
        severity: 'high',
        confidenceScore: 95,
        sourceIds: ['ev-1'], // Valid source ID in mockEvidenceMap
        actionableMitigation: 'Book rides via authorized hotel dispatch or verified app.',
      },
    ],
    forgottenChecklist: [
      {
        category: 'travel_advisories',
        status: 'adequately_checked',
        evidenceCount: 1,
        gapAnalysis: 'Advisories checked.',
        recommendedAction: 'Continue monitoring.',
      },
    ],
  };

  const result = AiValidator.validate(validOutput, mockEvidenceMap);
  assert.strictEqual(result.isValid, true, 'Valid grounded output should pass');
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.sanitizedOutput.findings.length, 1);
  assert.strictEqual(result.sanitizedOutput.findings[0].sourceIds[0], 'ev-1');
});

console.log(`\n========================================`);
console.log(`🏁 Test Summary: ${passedTests}/${totalTests} tests passed.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
