import * as repo from './diagnoses.repository.js';
import { saveImage } from '../../config/storage.js';
import { enqueue } from '../../jobs/queue.js';
import { ApiError } from '../../utils/ApiError.js';
import { OFFICER_ROLES } from '../../utils/constants.js';
import { offsetOf, pageMeta } from '../../utils/schemas.js';
import { getAccessibleFarm, getOwnedFarm } from '../farms/farms.service.js';

/** Shape defined in docs/API_SPECIFICATION.md section 2.3 */
export function toApi(row) {
  const completed = row.status === 'completed';
  return {
    id: row.id,
    farm_id: row.farm_id,
    crop: row.crop,
    status: row.status,
    image_url: row.image_url,
    symptoms: row.symptoms,
    result: completed
      ? {
          type: row.type,
          name: row.name,
          confidence: row.confidence,
          severity: row.severity,
          severity_pct: row.severity_pct,
          treatment: row.treatment,
          low_confidence: row.low_confidence,
          model_version: row.model_version,
        }
      : null,
    error_code: row.error_code,
    created_at: row.created_at,
  };
}

export async function create(user, { farm_id: farmId, crop, symptoms }, file, requestId) {
  if (!file && !symptoms) {
    throw ApiError.badRequest('Provide an image or describe the symptoms', [
      { field: 'image', issue: 'Either image or symptoms is required' },
    ]);
  }
  await getOwnedFarm(farmId, user);
  const imageUrl = file ? await saveImage(file) : null;
  const row = await repo.create({ userId: user.id, farmId, crop, imageUrl, symptoms });
  await enqueue('diagnosis', { diagnosisId: row.id, requestId });
  return { diagnosis_id: row.id, status: row.status };
}

export async function get(id, user) {
  const row = await repo.findById(id);
  if (!row) throw ApiError.notFound('Diagnosis not found');
  if (row.user_id !== user.id && !OFFICER_ROLES.includes(user.role)) throw ApiError.forbidden();
  return toApi(row);
}

export async function list(user, { farm_id: farmId, page, limit }) {
  if (farmId) await getAccessibleFarm(farmId, user);
  const officer = OFFICER_ROLES.includes(user.role);
  const { rows, total } = await repo.list({
    userId: officer ? null : user.id,
    farmId,
    limit,
    offset: offsetOf({ page, limit }),
  });
  return { rows: rows.map(toApi), meta: pageMeta({ page, limit }, total) };
}
