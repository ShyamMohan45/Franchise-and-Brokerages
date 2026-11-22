# FranchiseBridge – Production Password Reset & Resend API Deployment Guide

This document specifies the configuration and operational deployment steps for the FranchiseBridge Password Recovery subsystem using the **Resend API** (`resend` SDK) across Render (Backend) and Vercel (Frontend).

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
8. **Resend API Acceptance**: Outbound emails are accepted via Resend REST API SDK with explicit response verification (`data.id`), 10-second request timeout, and error handling.
9. **Sanitized Logging**: Server logs never record reset tokens, passwords, raw reset URLs, or Resend API keys.

---

## 2. Render Environment Variables (Backend Web Service)

Configure these variables in your **Render Dashboard** under **Environment**:

| Environment Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | `re_your_resend_api_key` | Resend API key generated from the Resend console |
| `FROM_EMAIL` | `onboarding@resend.dev` *(Initial)* or `notifications@franchisebridge.com` *(Production)* | Sender email address. Uses onboarding domain until your custom domain is verified. |
| `CLIENT_URL` | `https://your-active-vercel-domain.vercel.app` | Production frontend domain used to construct reset link URL |

> [!IMPORTANT]
> **Never commit real Resend API keys to Git or `.env` files.**
> Set them exclusively in the secure Render web dashboard.

---

## 3. Resend Setup & Custom Domain Verification

### A. Initial Testing (Sandbox)
1. Sign in to your [Resend Dashboard](https://resend.com).
2. Go to **API Keys** and click **Create API Key**.
3. Set permission to **Full access** (or Sending access) and name it `FranchiseBridge-Production`.
4. Copy the key starting with `re_` and set it as `RESEND_API_KEY` on Render.
5. In sandbox mode, Resend permits sending from `onboarding@resend.dev` to the email associated with your Resend account. Set `FROM_EMAIL=onboarding@resend.dev`.

### B. Production Custom Domain Verification (Sending to all users)
To send password reset emails to any recipient email address:
1. In Resend Dashboard, navigate to **Domains** &rarr; click **Add Domain**.
2. Enter your domain (e.g. `franchisebridge.com` or `mail.franchisebridge.com`).
3. Select your preferred region (e.g., North America or EU).
4. Resend will generate required DNS records:
   - **DKIM** (TXT / CNAME)
   - **SPF** (TXT)
   - **MX / Return-Path**
5. Add these DNS records in your domain registrar / DNS provider (Cloudflare, Namecheap, GoDaddy, etc.).
6. Click **Verify DNS Records** in Resend.
7. Once verified, update the Render environment variable:
   `FROM_EMAIL=notifications@franchisebridge.com`
   *(or `FranchiseBridge <notifications@franchisebridge.com>`)*. No backend code modifications are needed.

---

## 4. Vercel Environment Variables (Frontend Project)

Verify that the following environment variables are configured in **Vercel** under **Project Settings > Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://franchisebridge-api-u54k.onrender.com/api` | Base API URL used by `@/lib/api` client |
| `NEXT_PUBLIC_API_HOST` | `https://franchisebridge-api-u54k.onrender.com` | Root API host used for media and health checks |
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
