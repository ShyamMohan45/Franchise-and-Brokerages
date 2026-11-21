import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshSession);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email', verifyEmail);
router.get('/verify-email/:token', verifyEmail);
router.post('/change-password', requireAuth, changePassword);

export default router;
