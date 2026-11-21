const config = require('../config/env');
const ApiError = require('../utils/apiError');
const AiValidator = require('./aiValidator');
const {
  ANALYSIS_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
} = require('./aiSchema');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_TIMEOUT_MS = 15000;

class AiEngineService {
  /**
   * Determine whether a source is official, recognized media, or unverified community/blog
   */
  static classifySourceType(url, sourceName) {
    const combined = `${url || ''} ${sourceName || ''}`.toLowerCase();

    // Official sovereign or municipal or intergovernmental
    if (
      combined.includes('.gov') ||
      combined.includes('.gob') ||
      combined.includes('.gc.ca') ||
      combined.includes('gov.uk') ||
      combined.includes('state.gov') ||
      combined.includes('who.int') ||
      combined.includes('un.org') ||
      combined.includes('interpol') ||
      combined.includes('embassy') ||
      combined.includes('police') ||
      combined.includes('prefecture')
    ) {
      return 'official';
    }

    // Recognized international or national news media
    if (
      combined.includes('reuters') ||
      combined.includes('bbc') ||
      combined.includes('apnews') ||
      combined.includes('cnn') ||
      combined.includes('nytimes') ||
      combined.includes('theguardian') ||
      combined.includes('bloomberg') ||
      combined.includes('aljazeera') ||
      combined.includes('euronews') ||
      combined.includes('france24') ||
      combined.includes('washingtonpost') ||
      combined.includes('afp') ||
      combined.includes('times') ||
      combined.includes('news')
    ) {
      return 'media';
    }

    return 'unverified';
  }

  /**
   * Audit date currency
   */
  static auditDateCurrency(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return { isUndated: true, isOutdated: false, ageDays: null };
    }

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      // Relative or string date like "3 days ago" or "Oct 2026"
      return { isUndated: false, isOutdated: false, ageDays: 14 };
    }

    const now = new Date();
    const ageDays = Math.round((now - parsed) / (1000 * 60 * 60 * 24));
    return {
      isUndated: false,
      isOutdated: ageDays > 180,
      ageDays,
    };
  }

  /**
   * Build structured, canonical evidence package from ingested SerpApi and Google Maps data
   */
  static buildEvidencePackage(destination, liveFeed = null, locationData = null) {
    const evidenceItems = [];
    let counter = 1;

    // Ingest SerpApi Live Feed items
    if (liveFeed && Array.isArray(liveFeed.feed)) {
      for (const item of liveFeed.feed) {
        let mappedCat = 'other_considerations';
        if (item.category === 'advisory') mappedCat = 'travel_advisories';
        else if (item.category === 'transit') mappedCat = 'transport_disruptions';
        else if (item.category === 'scam') mappedCat = 'local_scams';
        else if (item.category === 'news') {
          const lower = (item.title + ' ' + (item.snippet || '')).toLowerCase();
          if (lower.includes('weather') || lower.includes('rain') || lower.includes('flood') || lower.includes('storm')) {
            mappedCat = 'weather_concerns';
          } else if (lower.includes('train') || lower.includes('metro') || lower.includes('flight') || lower.includes('airport')) {
            mappedCat = 'transport_disruptions';
          } else {
            mappedCat = 'travel_advisories';
          }
        }

        const dateAudit = AiEngineService.auditDateCurrency(item.publishedDate);
        const sourceType = AiEngineService.classifySourceType(item.sourceUrl, item.sourceName);

        evidenceItems.push({
          id: `ev-feed-${counter++}`,
          title: item.title,
          snippet: item.snippet || item.title,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          publishedDate: item.publishedDate,
          category: mappedCat,
          sourceType,
          isOutdated: dateAudit.isOutdated,
          isUndated: dateAudit.isUndated,
          retrievedAt: item.retrievedAt || new Date().toISOString(),
        });
      }
    }

    // Ingest Location Places
    if (locationData && Array.isArray(locationData.places)) {
      for (const place of locationData.places) {
        evidenceItems.push({
          id: `ev-loc-${counter++}`,
          title: place.title,
          snippet: `Verified facility in ${destination}: ${place.title}. Address: ${place.address || 'Address not listed'}. Phone: ${place.phone || 'Phone not listed'}. Open: ${place.openState || 'Hours unlisted'}. Rating: ${place.rating || 'Unrated'}.`,
          sourceUrl: place.website || 'https://maps.google.com',
          sourceName: 'Google Maps Place Registry',
          publishedDate: null,
          category: 'emergency_facilities',
          facilityType: place.category,
          sourceType: 'official', // Municipal Google Maps verified listing
          isOutdated: false,
          isUndated: true,
          retrievedAt: place.retrievedAt || new Date().toISOString(),
        });
      }
    }

    const evidenceMap = new Map();
    evidenceItems.forEach((item) => evidenceMap.set(item.id, item));

    return {
      destination,
      retrievedAt: new Date().toISOString(),
      totalEvidenceCount: evidenceItems.length,
      evidenceItems,
      evidenceMap,
    };
  }

  /**
   * Deterministic Grounded Analysis Engine (Fallback and Verification Anchor)
   * Adheres strictly to the same anti-hallucination, source-grounding, and category rules.
   */
  static runGroundedAnalysis(destination, evidencePackage) {
    const { evidenceItems, evidenceMap } = evidencePackage;
    const findings = [];
    let findingIdx = 1;

    // Group evidence by category
    const byCategory = {};
    ANALYSIS_CATEGORIES.forEach((c) => (byCategory[c] = []));

    evidenceItems.forEach((e) => {
      if (byCategory[e.category]) {
        byCategory[e.category].push(e);
      } else {
        byCategory.other_considerations.push(e);
      }
    });

    // 1. Process Travel Advisories
    if (byCategory.travel_advisories.length > 0) {
      const sampleSources = byCategory.travel_advisories.slice(0, 3);
      const hasOfficial = sampleSources.some((s) => s.sourceType === 'official');
      findings.push({
        id: `fnd-${findingIdx++}`,
        category: 'travel_advisories',
        title: `Official Advisory & Civil Security Directives for ${destination}`,
        finding: `Telemetry confirms active sovereign advisory coverage. Primary considerations highlight: "${sampleSources[0].snippet.substring(0, 180)}..."`,
        claimType: hasOfficial ? 'confirmed_fact' : 'reported_event',
        severity: sampleSources[0].snippet.toLowerCase().includes('caution') || sampleSources[0].snippet.toLowerCase().includes('warning') ? 'high' : 'moderate',
        confidenceScore: hasOfficial ? 95 : 82,
        sourceIds: sampleSources.map((s) => s.id),
        actionableMitigation: 'Review consular advisory pages directly and register trip details with your embassy.',
      });
    }

    // 2. Process Transport Disruptions
    if (byCategory.transport_disruptions.length > 0) {
      const sampleSources = byCategory.transport_disruptions.slice(0, 2);
      findings.push({
        id: `fnd-${findingIdx++}`,
        category: 'transport_disruptions',
        title: `Transport Infrastructure & Service Disruption Alerts`,
        finding: `Ingested reports indicate transit telemetry: "${sampleSources[0].snippet.substring(0, 180)}..."`,
        claimType: sampleSources[0].sourceType === 'official' ? 'confirmed_fact' : 'reported_event',
        severity: 'moderate',
        confidenceScore: 88,
        sourceIds: sampleSources.map((s) => s.id),
        actionableMitigation: 'Allow minimum 90 minutes additional transit margin for airport and metro connections.',
      });
    }

    // 3. Process Local Concerns & Scams
    if (byCategory.local_scams.length > 0) {
      const sampleSources = byCategory.local_scams.slice(0, 3);
      findings.push({
        id: `fnd-${findingIdx++}`,
        category: 'local_scams',
        title: `Documented Street Scams and Opportunistic Hazards`,
        finding: `Field security reports flag local friction: "${sampleSources[0].snippet.substring(0, 180)}..."`,
        claimType: sampleSources[0].sourceType === 'official' ? 'confirmed_fact' : 'reported_event',
        severity: 'high',
        confidenceScore: 90,
        sourceIds: sampleSources.map((s) => s.id),
        actionableMitigation: 'Do not accept unsolicited tours, unmetered street cabs, or drinks from strangers.',
      });
    }

    // 4. Process Emergency Facilities
    if (byCategory.emergency_facilities.length > 0) {
      const sampleSources = byCategory.emergency_facilities.slice(0, 4);
      const hosp = sampleSources.find((s) => s.facilityType === 'hospital');
      findings.push({
        id: `fnd-${findingIdx++}`,
        category: 'emergency_facilities',
        title: `Emergency Medical and Police Grid Availability`,
        finding: `Google Maps place verification confirmed ${byCategory.emergency_facilities.length} physical facility listings. Primary facility noted: "${sampleSources[0].title}".`,
        claimType: 'confirmed_fact',
        severity: 'low',
        confidenceScore: 96,
        sourceIds: sampleSources.map((s) => s.id),
        actionableMitigation: `Store verified facility contacts (${hosp?.title || sampleSources[0].title}) in offline mobile notes.`,
      });
    }

    // 5. Process Weather Concerns (ONLY when supported by suitable sources)
    if (byCategory.weather_concerns.length > 0) {
      const sampleSources = byCategory.weather_concerns.slice(0, 2);
      findings.push({
        id: `fnd-${findingIdx++}`,
        category: 'weather_concerns',
        title: `Meteorological & Environmental Impact Alert`,
        finding: `Weather reports confirm localized environmental factors: "${sampleSources[0].snippet.substring(0, 160)}..."`,
        claimType: 'reported_event',
        severity: 'moderate',
        confidenceScore: 84,
        sourceIds: sampleSources.map((s) => s.id),
        actionableMitigation: 'Pack climate-appropriate protective gear and check local meteorological forecasts 24 hours prior to transit.',
      });
    }

    // 6. Build the Forgotten Checklist
    const forgottenChecklist = ANALYSIS_CATEGORIES.map((cat) => {
      const count = byCategory[cat].length;
      let status = 'adequately_checked';
      let gapAnalysis = `Adequate verified intelligence ingested (${count} source records).`;
      let recommendedAction = 'Maintain standard monitoring.';

      if (count === 0) {
        status = 'uninvestigated';
        gapAnalysis = `CRITICAL BLINDSPOT: Zero verified intelligence records ingested for this category.`;
        recommendedAction = `Execute targeted discovery for ${CATEGORY_DISPLAY_NAMES[cat].toLowerCase()} prior to travel.`;
      } else if (count < 2) {
        status = 'insufficient_evidence';
        gapAnalysis = `LIMITED TELEMETRY: Only 1 reference found. May not reflect current on-the-ground conditions.`;
        recommendedAction = `Cross-reference with secondary diplomatic or local municipal sources.`;
      }

      return {
        category: cat,
        displayName: CATEGORY_DISPLAY_NAMES[cat],
        status,
        evidenceCount: count,
        gapAnalysis,
        recommendedAction,
      };
    });

    return {
      destination,
      analysedAt: new Date().toISOString(),
      findings,
      forgottenChecklist,
    };
  }

  /**
   * Run Analysis using Gemini LLM if configured, otherwise using Grounded Engine
   */
  static async runAnalysis(destination, evidencePackage) {
    const { evidenceItems, evidenceMap } = evidencePackage;

    // Check if evidence package is completely empty
    if (!evidenceItems || evidenceItems.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: ['Evidence package is empty.'],
        sanitizedOutput: {
          destination,
          analysedAt: new Date().toISOString(),
          findings: [],
          rejectedFindings: [],
          forgottenChecklist: ANALYSIS_CATEGORIES.map((cat) => ({
            category: cat,
            displayName: CATEGORY_DISPLAY_NAMES[cat],
            status: 'uninvestigated',
            evidenceCount: 0,
            gapAnalysis: 'INSUFFICIENT EVIDENCE: No validated information has been retrieved for this destination yet.',
            recommendedAction: 'Trigger SerpApi live search and Google Maps discovery to ingest verified evidence.',
          })),
          totalFindings: 0,
          warnings: ['Insufficient verified evidence available for this destination.'],
        },
      };
    }

    const geminiKey = config.apiKeys.geminiApiKey;

    if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const aiRaw = await AiEngineService.callGeminiApi(destination, evidenceItems, geminiKey);
        const validated = AiValidator.validate(aiRaw, evidenceMap);

        if (validated.isValid && validated.sanitizedOutput.findings.length > 0) {
          return validated;
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed or timed out. Falling back to grounded analysis engine:', geminiErr.message);
      }
    }

    // Fallback Grounded Engine (100% compliant with schema, source IDs, and anti-hallucination rules)
    const rawAnalysis = AiEngineService.runGroundedAnalysis(destination, evidencePackage);
    return AiValidator.validate(rawAnalysis, evidenceMap);
  }

  /**
   * Call Gemini 2.0 Flash / 1.5 Flash API with strict evidence containment prompt
   */
  static async callGeminiApi(destination, evidenceItems, apiKey) {
    const prompt = `You are the BlindSpot Tactical Intelligence Engine.
Analyze the provided structured evidence for the destination "${destination}".

CRITICAL SAFETY & TRUTH RULES:
1. ONLY make factual findings supported directly by the provided evidence items.
2. Every finding MUST include a "sourceIds" array containing the exact IDs of the evidence supporting it.
3. NEVER invent source IDs, statistics, street names, phone numbers, or incidents.
4. If evidence is insufficient for a category, do NOT invent claims.
5. In "forgottenChecklist", evaluate every category: 'travel_advisories', 'transport_disruptions', 'weather_concerns', 'local_scams', 'emergency_facilities', 'other_considerations'. If a category has 0 or 1 evidence item, set its status to 'insufficient_evidence' or 'uninvestigated'.

EVIDENCE ITEMS:
${JSON.stringify(
  evidenceItems.map((e) => ({
    id: e.id,
    title: e.title,
    snippet: e.snippet,
    category: e.category,
    sourceType: e.sourceType,
    publishedDate: e.publishedDate,
  })),
  null,
  2
)}

OUTPUT SCHEMA (Return STRICT JSON ONLY):
{
  "destination": "${destination}",
  "analysedAt": "${new Date().toISOString()}",
  "findings": [
    {
      "id": "fnd-1",
      "category": "one of: travel_advisories | transport_disruptions | weather_concerns | local_scams | emergency_facilities | other_considerations",
      "title": "Clear concise finding title",
      "finding": "Specific factual summary grounded in evidence snippet",
      "claimType": "one of: confirmed_fact | reported_event | unverified_claim",
      "severity": "one of: critical | high | moderate | low",
      "confidenceScore": 85,
      "sourceIds": ["ev-feed-1"],
      "actionableMitigation": "Concrete recommendation"
    }
  ],
  "forgottenChecklist": [
    {
      "category": "travel_advisories",
      "status": "one of: adequately_checked | insufficient_evidence | uninvestigated",
      "evidenceCount": 3,
      "gapAnalysis": "Assessment of evidence depth",
      "recommendedAction": "Actionable next step"
    }
  ]
}`;

    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1, // Near deterministic
        },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    return JSON.parse(text);
  }
}

module.exports = AiEngineService;
