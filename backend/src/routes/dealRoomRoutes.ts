import { Router } from 'express';
import {
  getDealRooms,
  getDealRoomById,
  getDealRoomDocuments,
  uploadDealRoomDocument,
  uploadDealDocumentVersion,
  downloadDealDocument,
  updateDealDocumentStatus,
  deleteDealDocument,
  getDealRoomDueDiligence,
  updateDealRoomDueDiligenceItem,
  getDealRoomMessages,
  postDealRoomMessage,
  signDealRoomDocument,
} from '../controllers/dealRoomController';
import { requireAuth } from '../middleware/auth';
import { privateDocumentUpload } from '../middleware/privateUpload';
import { validate } from '../middleware/validate';
import {
  createDealDocumentSchema,
  updateDealDocumentStatusSchema,
  updateDiligenceItemSchema,
  createDealMessageSchema,
} from '../validators/dealRoomValidators';

const router = Router();

// Deal Room Workspaces
router.get('/', requireAuth, getDealRooms);
router.get('/:id', requireAuth, getDealRoomById);

// Documents & Private Storage
router.get('/:id/documents', requireAuth, getDealRoomDocuments);
router.post(
  '/:id/documents',
  requireAuth,
  privateDocumentUpload.single('file'),
  validate(createDealDocumentSchema),
  uploadDealRoomDocument
);
router.post(
  '/:id/documents/:docId/versions',
  requireAuth,
  privateDocumentUpload.single('file'),
  uploadDealDocumentVersion
);
router.get('/:id/documents/:docId/download', requireAuth, downloadDealDocument);
router.patch(
  '/:id/documents/:docId/status',
  requireAuth,
  validate(updateDealDocumentStatusSchema),
  updateDealDocumentStatus
);
router.delete('/:id/documents/:docId', requireAuth, deleteDealDocument);

// Due Diligence Checklist
router.get('/:id/due-diligence', requireAuth, getDealRoomDueDiligence);
router.patch(
  '/:id/due-diligence/:itemId',
  requireAuth,
  validate(updateDiligenceItemSchema),
  updateDealRoomDueDiligenceItem
);

// Deal Room Communications (Public & Internal Broker Notes)
router.get('/:id/messages', requireAuth, getDealRoomMessages);
router.post(
  '/:id/messages',
  requireAuth,
  validate(createDealMessageSchema),
  postDealRoomMessage
);

// E-Sign Agreement Execution
router.post('/:id/sign', requireAuth, signDealRoomDocument);

export default router;
