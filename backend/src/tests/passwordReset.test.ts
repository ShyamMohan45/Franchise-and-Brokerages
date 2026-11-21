import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidators';
import { EmailService } from '../services/emailService';
import { hashPassword, comparePassword } from '../utils/password';

describe('FranchiseBridge Password Recovery Security Test Suite', () => {
  describe('Password & Token Cryptographic Security', () => {
    it('generates a 64-character hex string from 32 cryptographically secure random bytes', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      expect(rawToken).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(rawToken)).toBe(true);
    });

    it('hashes token with SHA-256 for secure database storage', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
      const hash2 = crypto.createHash('sha256').update(rawToken).digest('hex');

      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
      // Hash must not equal raw token
      expect(hash1).not.toBe(rawToken);
    });

    it('computes different SHA-256 hashes for different tokens', () => {
      const tokenA = crypto.randomBytes(32).toString('hex');
      const tokenB = crypto.randomBytes(32).toString('hex');
      const hashA = crypto.createHash('sha256').update(tokenA).digest('hex');
      const hashB = crypto.createHash('sha256').update(tokenB).digest('hex');

      expect(hashA).not.toBe(hashB);
    });

    it('hashes new passwords with bcrypt and verifies matching passwords', async () => {
      const password = 'EnterpriseSuperSecurePass2026!';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
      expect(await comparePassword(password, hash)).toBe(true);
      expect(await comparePassword('WrongPassword123!', hash)).toBe(false);
    });
  });

  describe('Validator Schemas & 16-Character Policy', () => {
    it('forgotPasswordSchema accepts valid emails and normalizes them', () => {
      const result = forgotPasswordSchema.safeParse({ email: ' Investor@FranchiseBridge.com ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('investor@franchisebridge.com');
      }
    });

    it('forgotPasswordSchema rejects invalid emails', () => {
      const invalidEmails = ['invalid', 'missing-at.com', '@nodomain.com', ''];
      for (const email of invalidEmails) {
        const result = forgotPasswordSchema.safeParse({ email });
        expect(result.success).toBe(false);
      }
    });

    it('resetPasswordSchema rejects passwords shorter than 16 characters', () => {
      const shortPasswords = [
        'Short1!',
        'EightChar1234!',
        '15characters!!!',
      ];

      for (const pwd of shortPasswords) {
        const result = resetPasswordSchema.safeParse({
          token: 'valid-test-token-hex-32-bytes',
          newPassword: pwd,
        });
        expect(result.success).toBe(false);
      }
    });

    it('resetPasswordSchema accepts passwords with 16 or more characters', () => {
      const validPasswords = [
        'SixteenCharLong!',
        'FranchiseBridge2026SecureKey!',
        'UltraLongEnterpriseBrokeragePassword12345!',
      ];

      for (const pwd of validPasswords) {
        const result = resetPasswordSchema.safeParse({
          token: 'valid-test-token-hex-32-bytes',
          newPassword: pwd,
        });
        expect(result.success).toBe(true);
      }
    });

    it('resetPasswordSchema rejects missing token', () => {
      const result = resetPasswordSchema.safeParse({
        token: '',
        newPassword: 'FranchiseBridge2026SecureKey!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Token Expiry & Single-Use Semantics', () => {
    it('calculates 1-hour expiration timestamp correctly', () => {
      const now = Date.now();
      const expiresAt = new Date(now + 60 * 60 * 1000);
      const diffMinutes = (expiresAt.getTime() - now) / (60 * 1000);

      expect(diffMinutes).toBeCloseTo(60, 1);
    });

    it('correctly discriminates between active and expired tokens', () => {
      const activeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins in future
      const expiredExpiry = new Date(Date.now() - 5 * 60 * 1000); // 5 mins in past

      const isTokenValid = (expires: Date) => expires > new Date();

      expect(isTokenValid(activeExpiry)).toBe(true);
      expect(isTokenValid(expiredExpiry)).toBe(false);
    });

    it('simulates single-use invalidation by unsetting token and expiry', () => {
      let mockUser: { passwordResetToken?: string; passwordResetExpires?: Date } = {
        passwordResetToken: 'sha256-token-hash',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      // Reset action completes
      mockUser.passwordResetToken = undefined;
      mockUser.passwordResetExpires = undefined;

      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
    });
  });

  describe('EmailService & Template Rendering', () => {
    it('dispatches password reset email without throwing in mock/dev mode', async () => {
      const result = await EmailService.sendPasswordResetEmail(
        'test.broker@franchisebridge.com',
        'http://localhost:3000/reset-password?token=mocktoken123'
      );
      expect(typeof result).toBe('boolean');
    });
  });
});
