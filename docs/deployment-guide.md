# FranchiseBridge: Production Deployment Guide

## Architecture Topology
- **Frontend**: Next.js App Router deployed on **Vercel**
- **Backend API**: Node.js + Express.js deployed on **Render / Railway / AWS ECS**
- **Database**: **MongoDB Atlas** (M10+ recommended for production clustering & backups)
- **Object Storage / Vault**: Cloudinary or AWS S3 Private Vault for FDD documents and logos

---

## 1. Environment Configurations

### Backend `.env`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<dbuser>:<password>@cluster0.mongodb.net/franchisebridge?retryWrites=true&w=majority
JWT_SECRET=super_secret_production_jwt_signing_key_replace_me
JWT_REFRESH_SECRET=super_secret_production_refresh_signing_key_replace_me
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://franchisebridge.vercel.app
COOKIE_SECRET=super_secret_production_cookie_signing_key
```

### Frontend `.env.production`
```env
NEXT_PUBLIC_API_URL=https://api.franchisebridge.com/api
```

---

## 2. Backend Deployment (Render / Railway)
1. Link GitHub repository to Render/Railway.
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables as specified above.
6. Verify `/health` endpoint returns `HTTP 200` with `status: "healthy"`.

---

## 3. Frontend Deployment (Vercel)
1. Import repository into Vercel.
2. Root Directory: `frontend`
3. Framework Preset: Next.js
4. Build Command: `next build`
5. Configure `NEXT_PUBLIC_API_URL` pointing to the live backend domain.
6. Deploy.

---

## 4. Initial Database Seeding
To seed production or staging with initial administrative accounts and foundational industry categories:
```bash
cd backend
npm run seed
```
This initializes super admin and broker credentials alongside realistic reference brands.
