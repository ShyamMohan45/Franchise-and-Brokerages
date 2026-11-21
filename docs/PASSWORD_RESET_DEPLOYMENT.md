# FranchiseBridge – Production Password Reset & SMTP Deployment Guide

This document specifies the configuration and operational deployment steps for the FranchiseBridge Password Recovery and Email Service subsystem across Render (Backend) and Vercel (Frontend).

---

## 1. Security Architecture Overview

The FranchiseBridge password reset flow is built with enterprise security controls:

1. **Cryptographic Token Generation**: 32 bytes of cryptographically secure randomness generated via Node.js `crypto.randomBytes(32).toString('hex')` (64 hex characters).
2. **One-Way Token Hashing**: Raw reset tokens are **never stored** in MongoDB Atlas. Only the one-way `SHA-256` digest is persisted in `User.passwordResetToken`.
3. **Single-Use Enforcement**: Upon successful password reset, both `passwordResetToken` and `passwordResetExpires` are explicitly set to `undefined` and cleared from the database document.
4. **Time-Bound Validity**: Tokens automatically expire after **1 hour** (`Date.now() + 60 * 60 * 1000`).
5. **No Account Enumeration**: The `POST /api/auth/forgot-password` endpoint always returns a generic response (`"If that email is registered, a password reset link has been sent."`) regardless of whether the email exists in the database.
6. **Strict Rate Limiting**: Dedicated rate limiting via `express-rate-limit` (10 requests per 15 minutes per IP address) is applied across both `/api/v1/auth/*` and `/api/auth/*` forgot/reset routes.
7. **Password Policy**: New passwords must contain **at least 16 characters**, enforced both on the client UI with real-time checklists and on the backend validator.
8. **Sanitized Logging**: Server logs never record reset tokens, passwords, raw reset URLs, or SMTP authentication credentials.

---

## 2. Render Environment Variables (Backend Web Service)

Configure these variables in your **Render Dashboard** under **Environment**:

| Environment Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server address |
| `SMTP_PORT` | `587` | Port 587 uses STARTTLS encryption |
| `SMTP_SECURE` | `false` | Must be `false` for port 587 (`true` is strictly for port 465 SSL) |
| `SMTP_USER` | `your-sender@gmail.com` | Your production sender Gmail address |
| `SMTP_PASS` | `your-16-char-app-password` | Google 16-character App Password (NOT your personal login password) |
| `FROM_EMAIL` | `your-sender@gmail.com` | Display sender email address |
| `CLIENT_URL` | `https://your-active-vercel-domain.vercel.app` | Production frontend domain used to construct reset link URL |

> [!IMPORTANT]
> **Never commit real SMTP credentials or App Passwords to Git or `.env` files.**
> Set them exclusively in the secure Render web dashboard.

---

## 3. How to Generate a Google Gmail App Password

1. Sign in to your organization's Google Account.
2. Go to **Google Account Security**: [https://myaccount.google.com/security](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is turned **ON**. Google requires 2FA to create app passwords.
4. In the top search bar within Google Account settings, search for **App passwords**.
5. Under **App name**, enter a descriptive label: `FranchiseBridge Production`.
6. Click **Create**.
7. Google will display a **16-character password** (e.g. `abcd efgh ijkl mnop`).
8. Copy this code, remove any spaces, and set it as `SMTP_PASS` in your Render Environment settings.

---

## 4. Vercel Environment Variables (Frontend Project)

Verify that the following environment variables are configured in **Vercel** under **Project Settings > Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://franchisebridge-api-u54k.onrender.com/api` | Base API URL used by `@/lib/api` client |
| `NEXT_PUBLIC_API_HOST` | `https://franchisebridge-api-u54k.onrender.com` | Root API host used for media and health checks |

---

## 5. Step-by-Step Deployment Instructions

### Backend (Render):
1. Navigate to your Render Dashboard: `https://dashboard.render.com`.
2. Select your `franchisebridge-api` web service.
3. Open **Environment** tab.
4. Add or update the 7 SMTP & Client variables listed in Section 2 above.
5. Click **Save Changes**. Render will automatically redeploy the service with the new configuration.
6. Verify deployment in the Render logs. The service should log:
   `[Database] Connection to MongoDB established.`
   `[EmailService] SMTP transport verified successfully.`

### Frontend (Vercel):
1. Navigate to your Vercel Dashboard: `https://vercel.com`.
2. Select your `franchisebridge` project.
3. Verify that `NEXT_PUBLIC_API_URL` points to your active Render API backend.
4. When git changes are pushed to your production branch, Vercel will build Next.js App Router with the new `/forgot-password` and `/reset-password` static routes.

---

## 6. End-to-End Verification Checklist

- [ ] **Login page link**: Navigate to `/login` and confirm clicking "Forgot password?" routes to `/forgot-password`.
- [ ] **Forgot password submission**: Submit an email address on `/forgot-password`. Verify that the generic success message appears without leaking account presence.
- [ ] **Reset Email receipt**: Check the recipient inbox for the FranchiseBridge branded email with the "Reset My Password" button.
- [ ] **Link click**: Click the email link. Confirm that it lands on `/reset-password?token=...` with the token parsed from query parameters.
- [ ] **Password validation checklist**: Enter a short password (< 16 characters) and mismatched confirmation; confirm that the UI disables submission and warns the user.
- [ ] **Successful reset**: Enter a valid 16+ character password and submit. Confirm success alert, countdown, and automatic redirect to `/login`.
- [ ] **Single-use invalidation**: Try to click the same reset link again. Confirm that the application rejects the expired/used token with a clear error and a link to request a new reset.
- [ ] **Login with new password**: Sign in using the updated password and verify successful workspace session establishment.
