import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';
import { EmailService } from '../services/emailService';

export async function register(req: Request, res: Response): Promise<any> {
  const { email, password, fullName, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    email,
    passwordHash,
    fullName,
    phone,
    role: role || 'business_owner',
    status: 'active',
    emailVerified: false,
    emailVerificationToken,
    verificationTokenExpires,
  });

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Set secure cookie
  res.cookie('fb_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Send verification email
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
  await EmailService.sendVerificationEmail(user.email, verifyUrl);

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(
    res,
    {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      token,
      refreshToken,
    },
    'Registration successful. Please verify your email.',
    201
  );
}

export async function login(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    return sendError(res, 'Account is suspended. Contact support.', 403);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.cookie('fb_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'USER_LOGGED_IN',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(
    res,
    {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      token,
      refreshToken,
    },
    'Login successful'
  );
}

export async function logout(req: Request, res: Response): Promise<any> {
  res.clearCookie('fb_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return sendSuccess(res, null, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response): Promise<any> {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  let businessProfile = null;
  let investorProfile = null;

  if (
    req.user.role === 'business_owner' ||
    req.user.role === 'brand_owner' ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin'
  ) {
    businessProfile = await BusinessProfile.findOne({ user: req.user._id });
  }

  if (
    req.user.role === 'investor' ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin'
  ) {
    investorProfile = await InvestorProfile.findOne({ user: req.user._id });
  }

  return sendSuccess(res, {
    user: {
      id: req.user._id,
      email: req.user.email,
      fullName: req.user.fullName,
      phone: req.user.phone,
      role: req.user.role,
      status: req.user.status,
      emailVerified: req.user.emailVerified,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
    },
    businessProfile,
    investorProfile,
  });
}

export async function refreshSession(req: Request, res: Response): Promise<any> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token required', 400);
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user || user.status === 'suspended') {
      return sendError(res, 'Invalid refresh token', 401);
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('fb_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { token }, 'Token refreshed successfully');
  } catch (err) {
    return sendError(res, 'Expired or invalid refresh token', 401);
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<any> {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 'Email address is required', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    // For security, do not disclose whether user exists
    return sendSuccess(res, null, 'If that email is registered, a password reset link has been sent.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = tokenHash;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await EmailService.sendPasswordResetEmail(user.email, resetUrl);

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'PASSWORD_RESET_REQUESTED',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'If that email is registered, a password reset link has been sent.');
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return sendError(res, 'Token and new password are required', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return sendError(res, 'Password reset token is invalid or has expired', 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'PASSWORD_RESET_COMPLETED',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'Password has been reset successfully. You may now log in.');
}

export async function verifyEmail(req: Request, res: Response): Promise<any> {
  const token = req.params.token || (req.query.token as string);
  if (!token) {
    return sendError(res, 'Verification token is required', 400);
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return sendError(res, 'Verification token is invalid or has expired', 400);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'EMAIL_VERIFIED',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'Email verified successfully.');
}

export async function changePassword(req: Request, res: Response): Promise<any> {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 'Current and new password are required', 400);
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    return sendError(res, 'Current password does not match', 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: user._id.toString(),
    ipAddress: req.ip,
  });

  return sendSuccess(res, null, 'Password changed successfully');
}
