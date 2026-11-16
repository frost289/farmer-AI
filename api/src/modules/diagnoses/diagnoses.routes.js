import { Router } from 'express';
import * as controller from './diagnoses.controller.js';
import { createDiagnosisSchema, listDiagnosesSchema } from './diagnoses.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { uploadImage } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../../utils/schemas.js';

const router = Router();
router.use(authenticate);
router.post('/', uploadImage, validate(createDiagnosisSchema), controller.create);
router.get('/', validate(listDiagnosesSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.get);
export default router;
