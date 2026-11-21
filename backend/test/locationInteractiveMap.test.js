const assert = require('assert');
const LocationService = require('../src/services/locationService');
const ApiError = require('../src/utils/apiError');

console.log('🧪 Starting Interactive Geographical Map & Location Intelligence Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    ${err.message}\n`);
    throw err;
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    ${err.message}\n`);
    throw err;
  }
}

async function runAllTests() {
  // Test 1: Coordinate Validation
  runTest('Should validate real geographical coordinates within WGS84 bounds', () => {
    const validOoty = LocationService.validateCoordinates({ latitude: 11.4102, longitude: 76.695 });
    assert.strictEqual(validOoty.lat, 11.4102);
    assert.strictEqual(validOoty.lng, 76.695);

    const validParis = LocationService.validateCoordinates({ latitude: '48.8566', longitude: '2.3522' });
    assert.strictEqual(validParis.lat, 48.8566);
    assert.strictEqual(validParis.lng, 2.3522);
  });

  // Test 2: Reject Corrupted / Missing Coordinates
  runTest('Should gracefully return null for missing or invalid coordinates without inventing numbers', () => {
    assert.strictEqual(LocationService.validateCoordinates(null), null);
    assert.strictEqual(LocationService.validateCoordinates(undefined), null);
    assert.strictEqual(LocationService.validateCoordinates({ latitude: 150, longitude: 50 }), null); // lat > 90
    assert.strictEqual(LocationService.validateCoordinates({ latitude: 10, longitude: 250 }), null); // lng > 180
    assert.strictEqual(LocationService.validateCoordinates({ latitude: 'not-a-number', longitude: 20 }), null);
  });

  // Test 3: Normalization Without Fabricating Missing Fields
  runTest('Should normalize real SerpApi place items and preserve null for absent fields', () => {
    const rawGooglePlace = {
      place_id: 'ChIJb6eB_ABCDEF123',
      title: 'Ooty District Headquarter Hospital',
      address: 'Hospital Road, Fingerpost, Ooty',
      phone: '+91 423 244 2212',
      rating: 4.2,
      reviews: 145,
      open_state: 'Open 24 hours',
      gps_coordinates: { latitude: 11.415, longitude: 76.698 },
    };

    const normalized = LocationService.normalizePlace(rawGooglePlace, 'hospital');
    assert.strictEqual(normalized.id, 'place-ChIJb6eB_ABCDEF123');
    assert.strictEqual(normalized.title, 'Ooty District Headquarter Hospital');
    assert.strictEqual(normalized.category, 'hospital');
    assert.strictEqual(normalized.phone, '+91 423 244 2212');
    assert.strictEqual(normalized.hasValidCoordinates, true);
    assert.strictEqual(normalized.coordinates.lat, 11.415);
    assert.strictEqual(normalized.coordinates.lng, 76.698);

    // Test with missing phone and coordinates
    const minimalPlace = {
      title: 'Local Pharmacy Depot',
    };
    const normMinimal = LocationService.normalizePlace(minimalPlace, 'pharmacy');
    assert.strictEqual(normMinimal.phone, null);
    assert.strictEqual(normMinimal.address, null);
    assert.strictEqual(normMinimal.coordinates, null);
    assert.strictEqual(normMinimal.hasValidCoordinates, false);
  });

  // Test 4: Deduplication Logic
  runTest('Should deduplicate duplicate places by stable ID or name+address', () => {
    const places = [
      { id: 'p1', title: 'General Hospital', address: 'Main St', category: 'hospital' },
      { id: 'p1', title: 'General Hospital', address: 'Main St', category: 'hospital' },
      { id: 'p2', title: 'General Hospital', address: 'Main St', category: 'hospital' }, // duplicate title+address
      { id: 'p3', title: 'City Clinic', address: 'Park Ave', category: 'hospital' },
    ];

    const deduplicated = LocationService.deduplicatePlaces(places);
    assert.strictEqual(deduplicated.length, 2);
    assert.strictEqual(deduplicated[0].id, 'p1');
    assert.strictEqual(deduplicated[1].id, 'p3');
  });

  // Test 5: Category Classification Coverage
  runTest('Should support hospitals, pharmacies, police, embassies, and transit categories', () => {
    const rawHosp = LocationService.normalizePlace({ title: 'City Hospital' }, 'hospital');
    const rawPharm = LocationService.normalizePlace({ title: 'Green Pharmacy' }, 'pharmacy');
    const rawPolice = LocationService.normalizePlace({ title: 'Central Police' }, 'police');
    const rawEmbassy = LocationService.normalizePlace({ title: 'Consular Office' }, 'embassy');
    const rawTransit = LocationService.normalizePlace({ title: 'Railway Junction' }, 'transit');

    assert.strictEqual(rawHosp.category, 'hospital');
    assert.strictEqual(rawPharm.category, 'pharmacy');
    assert.strictEqual(rawPolice.category, 'police');
    assert.strictEqual(rawEmbassy.category, 'embassy');
    assert.strictEqual(rawTransit.category, 'transit');
  });

  console.log(`\n========================================`);
  console.log(`🏁 Map & Location Tests: ${passedTests}/${totalTests} passed.`);
  console.log(`========================================\n`);
}

runAllTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
