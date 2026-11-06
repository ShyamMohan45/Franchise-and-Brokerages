import { Router } from 'express';
import {
  getSopDocuments,
  createSopDocument,
  updateSopStatus,
  getLegalDocuments,
  createLegalDocument,
  updateLegalDocStatus,
} from '../controllers/documentController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createSopDocumentSchema,
  updateSopStatusSchema,
  createLegalDocumentSchema,
  updateLegalDocStatusSchema,
} from '../validators/documentValidators';

const router = Router();

// SOP Routes
router.get('/sop', requireAuth, getSopDocuments);
router.post('/sop', requireAuth, validate(createSopDocumentSchema), createSopDocument);
router.patch('/sop/:id/status', requireAuth, requireRole('admin', 'super_admin'), validate(updateSopStatusSchema), updateSopStatus);

// Legal FDD Routes
router.get('/legal', requireAuth, getLegalDocuments);
router.post('/legal', requireAuth, validate(createLegalDocumentSchema), createLegalDocument);
router.patch('/legal/:id/status', requireAuth, requireRole('admin', 'super_admin'), validate(updateLegalDocStatusSchema), updateLegalDocStatus);

export default router;
