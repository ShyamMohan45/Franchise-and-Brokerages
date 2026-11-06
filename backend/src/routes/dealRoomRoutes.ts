import { Router } from 'express';
import {
  getDealRooms,
  getDealRoomById,
  postDealRoomMessage,
  signDealRoomDocument,
} from '../controllers/dealRoomController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getDealRooms);
router.get('/:id', protect, getDealRoomById);
router.post('/:id/messages', protect, postDealRoomMessage);
router.post('/:id/sign', protect, signDealRoomDocument);

export default router;
