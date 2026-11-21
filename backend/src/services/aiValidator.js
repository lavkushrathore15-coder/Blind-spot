const {
  ANALYSIS_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  CLAIM_TYPES,
  SEVERITIES,
  CHECKLIST_STATUSES,
  SOURCE_TYPES,
} = require('./aiSchema');

class AiValidator {
  /**
   * Validate AI Engine Output against strict schema, source ground truth, and anti-hallucination rules.
   *
   * @param {Object} aiResponse The raw or parsed JSON output from the AI model
   * @param {Map<string, Object>} evidenceMap Map of allowed evidence items keyed by ID
   * @returns {{ isValid: boolean, errors: string[], warnings: string[], sanitizedOutput: Object|null }}
   */
  static validate(aiResponse, evidenceMap = new Map()) {
    const errors = [];
    const warnings = [];

    if (!aiResponse || typeof aiResponse !== 'object') {
      return {
        isValid: false,
        errors: ['AI response is not a valid JSON object or is null.'],
        warnings: [],
        sanitizedOutput: null,
      };
    }

    // 1. Top-Level Field Validation
    if (!aiResponse.destination || typeof aiResponse.destination !== 'string') {
      errors.push('Missing or invalid "destination" string in AI response.');
    }

    if (!Array.isArray(aiResponse.findings)) {
      errors.push('Missing or invalid "findings" array in AI response.');
    }

    if (!Array.isArray(aiResponse.forgottenChecklist)) {
      errors.push('Missing or invalid "forgottenChecklist" array in AI response.');
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, sanitizedOutput: null };
    }

    // Build Set of allowed evidence IDs
    const allowedIds = new Set(evidenceMap.keys());
    const validFindings = [];
    const rejectedFindings = [];

    // 2. Validate Each Finding & Anti-Hallucination Guard
    for (let i = 0; i < aiResponse.findings.length; i++) {
      const f = aiResponse.findings[i];
      const findingIdx = `findings[${i}]`;

      if (!f || typeof f !== 'object') {
        errors.push(`${findingIdx}: Finding item is not an object.`);
        continue;
      }

      // Validate required fields
      if (!f.title || typeof f.title !== 'string' || f.title.trim() === '') {
        errors.push(`${findingIdx}: Missing or empty title.`);
        continue;
      }

      if (!f.finding || typeof f.finding !== 'string' || f.finding.trim() === '') {
        errors.push(`${findingIdx}: Missing or empty finding description.`);
        continue;
      }

      let itemHasError = false;

      if (!ANALYSIS_CATEGORIES.includes(f.category)) {
        errors.push(
          `${findingIdx}: Invalid category "${f.category}". Allowed: ${ANALYSIS_CATEGORIES.join(', ')}`
        );
        itemHasError = true;
      }

      if (!CLAIM_TYPES.includes(f.claimType)) {
        errors.push(
          `${findingIdx}: Invalid claimType "${f.claimType}". Allowed: ${CLAIM_TYPES.join(', ')}`
        );
        itemHasError = true;
      }

      if (!SEVERITIES.includes(f.severity)) {
        errors.push(
          `${findingIdx}: Invalid severity "${f.severity}". Allowed: ${SEVERITIES.join(', ')}`
        );
        itemHasError = true;
      }

      if (itemHasError) {
        continue;
      }

      // 3. Strict Source ID Enforcement (Reject Hallucinated Sources)
      if (!Array.isArray(f.sourceIds) || f.sourceIds.length === 0) {
        errors.push(
          `${findingIdx} ("${f.title}"): Hallucinated claim detected. Every finding must reference at least one valid source ID.`
        );
        rejectedFindings.push({ finding: f, reason: 'No source IDs provided' });
        continue;
      }

      // Check each referenced source ID against allowed evidence set
      const validSourceIds = [];
      const invalidSourceIds = [];

      for (const sId of f.sourceIds) {
        if (allowedIds.has(sId)) {
          validSourceIds.push(sId);
        } else {
          invalidSourceIds.push(sId);
        }
      }

      if (invalidSourceIds.length > 0) {
        errors.push(
          `${findingIdx} ("${f.title}"): Referenced nonexistent/hallucinated source IDs: [${invalidSourceIds.join(
            ', '
          )}].`
        );
      }

      // If all source IDs were invalid/hallucinated, reject this finding completely!
      if (validSourceIds.length === 0) {
        rejectedFindings.push({
          finding: f,
          reason: 'All referenced source IDs were non-existent in evidence package',
        });
        continue;
      }

      // 4. Grounding & Source Type Consistency
      const referencedEvidence = validSourceIds.map((id) => evidenceMap.get(id)).filter(Boolean);

      const hasOfficialSource = referencedEvidence.some((e) => e.sourceType === 'official');
      const hasMediaSource = referencedEvidence.some((e) => e.sourceType === 'media');
      const isExclusivelyUnverified = referencedEvidence.every((e) => e.sourceType === 'unverified');

      let sanitizedClaimType = f.claimType;
      // If AI claims "confirmed_fact" but evidence is only unverified social chatter, downgrade or warn
      if (f.claimType === 'confirmed_fact' && isExclusivelyUnverified) {
        warnings.push(
          `${findingIdx} ("${f.title}"): Claimed as "confirmed_fact" but only backed by unverified sources. Downgraded to "unverified_claim".`
        );
        sanitizedClaimType = 'unverified_claim';
      }

      // 5. Outdated / Undated Evidence Audit
      const outdatedSources = referencedEvidence.filter((e) => e.isOutdated);
      const undatedSources = referencedEvidence.filter((e) => e.isUndated);

      if (outdatedSources.length > 0) {
        warnings.push(
          `${findingIdx} ("${f.title}"): Backed by outdated evidence (>180 days old): [${outdatedSources
            .map((s) => s.id)
            .join(', ')}]`
        );
      }

      if (undatedSources.length > 0) {
        warnings.push(
          `${findingIdx} ("${f.title}"): Backed by undated evidence: [${undatedSources
            .map((s) => s.id)
            .join(', ')}]`
        );
      }

      validFindings.push({
        id: f.id || `fnd-${i + 1}`,
        category: f.category,
        title: f.title.trim(),
        finding: f.finding.trim(),
        claimType: sanitizedClaimType,
        severity: f.severity,
        confidenceScore: Math.min(100, Math.max(0, parseInt(f.confidenceScore, 10) || 75)),
        sourceIds: validSourceIds,
        actionableMitigation: f.actionableMitigation ? f.actionableMitigation.trim() : 'Maintain situational awareness.',
        evidenceDateStatus: outdatedSources.length > 0 ? 'outdated' : undatedSources.length > 0 ? 'undated' : 'current',
      });
    }

    // 6. Validate Forgotten Checklist
    const validatedChecklist = [];
    const checklistCategoriesSeen = new Set();

    for (const item of aiResponse.forgottenChecklist) {
      if (!item || !ANALYSIS_CATEGORIES.includes(item.category)) {
        continue;
      }

      checklistCategoriesSeen.add(item.category);

      let status = CHECKLIST_STATUSES.includes(item.status) ? item.status : 'insufficient_evidence';

      validatedChecklist.push({
        category: item.category,
        displayName: CATEGORY_DISPLAY_NAMES[item.category] || item.category,
        status,
        evidenceCount: parseInt(item.evidenceCount, 10) || 0,
        gapAnalysis: item.gapAnalysis ? item.gapAnalysis.trim() : 'Category coverage unverified.',
        recommendedAction: item.recommendedAction
          ? item.recommendedAction.trim()
          : 'Consult sovereign diplomatic travel advisories.',
      });
    }

    // Ensure all 6 categories are represented in the checklist
    for (const cat of ANALYSIS_CATEGORIES) {
      if (!checklistCategoriesSeen.has(cat)) {
        validatedChecklist.push({
          category: cat,
          displayName: CATEGORY_DISPLAY_NAMES[cat],
          status: 'uninvestigated',
          evidenceCount: 0,
          gapAnalysis: 'No verified intelligence streams were ingested for this category.',
          recommendedAction: `Perform dedicated discovery for ${CATEGORY_DISPLAY_NAMES[cat].toLowerCase()}.`,
        });
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      sanitizedOutput: {
        destination: aiResponse.destination,
        analysedAt: aiResponse.analysedAt || new Date().toISOString(),
        findings: validFindings,
        rejectedFindings,
        forgottenChecklist: validatedChecklist,
        totalFindings: validFindings.length,
        warnings,
      },
    };
  }
}

module.exports = AiValidator;
