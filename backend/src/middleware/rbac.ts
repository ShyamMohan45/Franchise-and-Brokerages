import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { sendError } from '../utils/response';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): any {
  return requireRole('admin', 'super_admin')(req, res, next);
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): any {
  return requireRole('super_admin')(req, res, next);
}
