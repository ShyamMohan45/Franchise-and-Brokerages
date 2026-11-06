import { Router } from 'express';
import { register, login, logout, getMe, refreshSession } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/authValidators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshSession);
router.get('/me', requireAuth, getMe);

export default router;
