import { Request, Response } from 'express';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';

export async function register(req: Request, res: Response): Promise<any> {
  const { email, password, fullName, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    phone,
    role: role || 'business_owner',
    status: 'active',
    emailVerified: true,
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
      },
      token,
      refreshToken,
    },
    'Registration successful',
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

  if (req.user.role === 'business_owner' || req.user.role === 'admin' || req.user.role === 'super_admin') {
    businessProfile = await BusinessProfile.findOne({ user: req.user._id });
  }

  if (req.user.role === 'investor' || req.user.role === 'admin' || req.user.role === 'super_admin') {
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
