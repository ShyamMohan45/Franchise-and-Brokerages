import { Router } from 'express';
import {
  getCommissionAgreements,
  getCommissionAgreementById,
  createCommissionAgreement,
  updateCommissionAgreementStatus,
  recordCommissionPayment,
  getCommissionStatement,
} from '../controllers/commissionController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCommissionAgreementSchema,
  updateCommissionAgreementStatusSchema,
  recordCommissionPaymentSchema,
} from '../validators/commissionValidators';

const router = Router();

router.use(requireAuth);

router.get('/agreements', getCommissionAgreements);
router.get('/agreements/:id', getCommissionAgreementById);
router.post('/agreements', validate(createCommissionAgreementSchema), createCommissionAgreement);
router.patch(
  '/agreements/:id/status',
  validate(updateCommissionAgreementStatusSchema),
  updateCommissionAgreementStatus
);

router.post('/payments', validate(recordCommissionPaymentSchema), recordCommissionPayment);
router.get('/agreements/:id/statement', getCommissionStatement);

export default router;
