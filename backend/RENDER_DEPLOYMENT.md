# FranchiseBridge Backend — Render Production Deployment Guide

This guide details the production deployment configuration for the **FranchiseBridge REST API Backend** on [Render](https://render.com).

---

## 1. Architecture Overview for Render

Render Web Services run in containerized environments with **ephemeral local filesystems**. Any file saved to the local disk (`./uploads/` or `./private_storage/`) is wiped whenever a service redeploys or restarts.

To ensure high availability and data durability:
* **Database:** Managed Cloud MongoDB Atlas via `MONGODB_URI`.
* **Object Storage:** AWS S3 via AWS SDK v3 with `STORAGE_DRIVER=s3`.
* **Process Binding:** Dynamic port binding via Render's `process.env.PORT`.

---

## 2. Render Web Service Settings

Configure the following settings in your Render dashboard:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Name** | `franchisebridge-backend` | Service identifier |
| **Environment** | `Node` | Node.js Runtime (v20+ recommended) |
| **Region** | `Singapore` or `Frankfurt` (choose closest to MongoDB Atlas & S3) | Network latency optimization |
| **Branch** | `main` | Production deployment branch |
| **Root Directory** | `backend` | Monorepo root directory for the API |
| **Build Command** | `npm install && npm run build` | Compiles TypeScript into `dist/` |
| **Start Command** | `npm start` | Runs `node dist/server.js` |
| **Health Check Path** | `/health` | Returns `200 OK` with database & service status |
| **Auto-Deploy** | `Yes` (Optional) | Deploys on git push to main |

---

## 3. Required Environment Variables Checklist

Add these environment variables in **Render Dashboard > Environment**:

### Core Server & Database
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/franchisebridge?retryWrites=true&w=majority
DB_MIN_POOL_SIZE=5
DB_MAX_POOL_SIZE=50
```
> *Note: Render automatically injects `PORT`. The server is configured to bind directly to `process.env.PORT`.*

### Cryptographic Secrets (Minimum 32 Characters)
```env
JWT_SECRET=production_super_secret_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=production_super_secret_refresh_key_at_least_32_characters_long
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=production_secure_cookie_secret_key_16_chars_min
```

### CORS & Origin Allowlist
```env
CLIENT_URL=https://your-frontend-app.onrender.com
ALLOWED_ORIGINS=https://your-frontend-app.onrender.com,https://franchisebridge.com
```

### AWS S3 Cloud Object Storage (Required on Render)
```env
STORAGE_DRIVER=s3
AWS_S3_BUCKET=franchisebridge-private-vault
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
```
*(Optional) If using MinIO, Cloudflare R2, or a custom S3-compatible service:*
```env
AWS_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
```

### Email Notifications (SMTP)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_or_ses_smtp_key
SMTP_SECURE=false
FROM_EMAIL=notifications@franchisebridge.com
```

---

## 4. AWS S3 Security & Permissions

FranchiseBridge enforces strict zero-trust document security:

1. **Bucket Privacy:**
   * Keep "Block all public access" **ON** in the AWS S3 console.
   * Do NOT attach public read bucket policies.
2. **Access Control:**
   * The backend streams files through authenticated routes (`GET /api/v1/deal-rooms/:id/documents/:docId/download`).
   * Only authorized participants (investor with NDA, assigned broker, brand owner, or admin) can download documents.
   * Every download is recorded in `AuditLog` with actor ID, role, and timestamp.
3. **IAM Policy for Render Service:**
   Attach the following minimal IAM policy to your AWS IAM user:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:HeadObject"
         ],
         "Resource": "arn:aws:s3:::franchisebridge-private-vault/*"
       }
     ]
   }
   ```

---

## 5. Verification After Deployment

Once Render deploys your backend, verify with these commands:

1. **Health Check:**
   ```bash
   curl -i https://your-backend-app.onrender.com/health
   # Expected: HTTP 200 with {"status":"healthy","database":{"state":"connected"}}
   ```
2. **API Info:**
   ```bash
   curl -i https://your-backend-app.onrender.com/api/v1/health
   # Expected: HTTP 200 with version and uptime
   ```
