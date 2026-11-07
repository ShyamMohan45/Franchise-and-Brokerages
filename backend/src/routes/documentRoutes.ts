import { Router } from 'express';
import {
  getSopDocuments,
  createSopDocument,
  updateSopStatus,
  getLegalDocuments,
  createLegalDocument,
  updateLegalDocStatus,
  uploadDocumentFile,
  getInvestorFddPackages,
  downloadDocument,
} from '../controllers/documentController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { documentUpload } from '../middleware/upload';
import {
  createSopDocumentSchema,
  updateSopStatusSchema,
  createLegalDocumentSchema,
  updateLegalDocStatusSchema,
} from '../validators/documentValidators';

const router = Router();

// File Upload Route (PDFs, Word documents, Images)
router.post('/upload', requireAuth, documentUpload.single('file'), uploadDocumentFile);

// SOP Routes
router.get('/sop', requireAuth, getSopDocuments);
router.post('/sop', requireAuth, validate(createSopDocumentSchema), createSopDocument);
router.patch('/sop/:id/status', requireAuth, requireRole('admin', 'super_admin'), validate(updateSopStatusSchema), updateSopStatus);

// Legal FDD Routes
router.get('/legal', requireAuth, getLegalDocuments);
router.get('/fdd-packages', requireAuth, getInvestorFddPackages);
router.post('/legal', requireAuth, validate(createLegalDocumentSchema), createLegalDocument);
router.patch('/legal/:id/status', requireAuth, requireRole('admin', 'super_admin'), validate(updateLegalDocStatusSchema), updateLegalDocStatus);
// Authorized Document Download
router.get('/:id/download', requireAuth, downloadDocument);

export default router;
