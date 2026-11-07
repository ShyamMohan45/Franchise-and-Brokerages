import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(requireAuth);

router.get('/', getTasks);
router.post('/', requireRole('broker', 'admin', 'super_admin'), createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
