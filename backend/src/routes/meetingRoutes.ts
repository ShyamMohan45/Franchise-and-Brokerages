import { Router } from 'express';
import { scheduleMeeting, getMyMeetings, updateMeetingStatus } from '../controllers/meetingController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.post('/', scheduleMeeting);
router.get('/my', getMyMeetings);
router.patch('/:id', updateMeetingStatus);

export default router;
