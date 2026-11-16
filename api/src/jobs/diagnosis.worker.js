import * as repo from '../modules/diagnoses/diagnoses.repository.js';
import * as farmsRepo from '../modules/farms/farms.repository.js';
import * as usersRepo from '../modules/users/users.repository.js';
import * as advisory from '../integrations/advisoryClient.js';
import * as vision from '../integrations/visionClient.js';
import { readImage } from '../config/storage.js';
import { logger } from '../config/logger.js';
import { LIMITS } from '../utils/constants.js';
import { currentSeason } from '../utils/season.js';

const EMPTY_TREATMENT = { organic: [], chemical: [], prevention: [], warnings: [] };

export const severityFromPct = (pct) => (pct <= 20 ? 'low' : pct <= 50 ? 'moderate' : 'high');

async function diagnoseImage(d, language, requestId) {
  const { buffer, mimetype } = await readImage(d.image_url);
  const v = await vision.diagnose({ buffer, mimetype, crop: d.crop, requestId });
  if (!v.quality?.usable) {
    return { failed: 'LOW_QUALITY_IMAGE' };
  }
  const top = v.predictions?.[0];
  if (!top) return { failed: 'NO_PREDICTION' };
  const severityPct = v.severity_pct ?? null;
  const treatment =
    top.type === 'healthy'
      ? EMPTY_TREATMENT
      : await advisory.treatment(
          { diagnosis: { label: top.label, severity_pct: severityPct }, crop: d.crop, language },
          requestId,
        );
  return {
    fields: {
      type: top.type,
      name: top.label,
      confidence: top.confidence,
      severity: severityPct == null ? null : severityFromPct(severityPct),
      severity_pct: severityPct,
      treatment,
      low_confidence: top.confidence < LIMITS.lowConfidence,
      model_version: v.model_version,
    },
  };
}

async function diagnoseSymptoms(d, language, requestId) {
  const farm = await farmsRepo.findById(d.farm_id);
  const question = `A farmer reports these symptoms on ${d.crop || 'a crop'}: ${d.symptoms}. What are the most likely diseases or pests, and what should the farmer do?`;
  const result = await advisory.query(
    { question, language, context: { crop: d.crop, district: farm?.district, season: currentSeason() } },
    requestId,
  );
  return {
    fields: {
      type: 'unknown',
      name: 'unknown',
      confidence: null,
      severity: null,
      severity_pct: null,
      treatment: { ...EMPTY_TREATMENT, warnings: [result.answer] },
      low_confidence: true,
      model_version: result.model_version,
    },
  };
}

export async function processDiagnosis({ diagnosisId, requestId }) {
  const d = await repo.findById(diagnosisId);
  if (!d) return;
  await repo.update(diagnosisId, { status: 'processing' });
  try {
    const language = (await usersRepo.findById(d.user_id))?.language || 'en';
    const outcome = d.image_url
      ? await diagnoseImage(d, language, requestId)
      : await diagnoseSymptoms(d, language, requestId);
    if (outcome.failed) {
      await repo.update(diagnosisId, { status: 'failed', error_code: outcome.failed });
      return;
    }
    await repo.update(diagnosisId, { status: 'completed', error_code: null, ...outcome.fields });
  } catch (err) {
    logger.error('Diagnosis failed', { diagnosis_id: diagnosisId, request_id: requestId, error: err.message });
    await repo.update(diagnosisId, { status: 'failed', error_code: err.code || 'INTERNAL_ERROR' });
  }
}
