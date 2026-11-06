import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User, IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: TokenPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    let token: string | undefined;

    // Check authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.fb_token) {
      // Or check secure httpOnly cookie
      token = req.cookies.fb_token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return sendError(res, 'User session expired or user not found.', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.fb_token) {
      token = req.cookies.fb_token;
    }

    if (token) {
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId);
      if (user && user.status !== 'suspended') {
        req.user = user;
        req.tokenPayload = payload;
      }
    }
  } catch {
    // continue without user
  }
  next();
}
