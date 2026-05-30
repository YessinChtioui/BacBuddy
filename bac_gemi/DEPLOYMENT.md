# BacBuddy Deployment Guide 🚀

This document outlines the step-by-step process for deploying BacBuddy to production using Vercel, Neon PostgreSQL, and Pusher.

## 1. Setup Neon PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) and create an account.
2. Create a new project named `BacBuddy`.
3. Copy the Postgres connection string from the dashboard.
4. Replace the `DATABASE_URL` in your `.env` file with this string.

## 2. Push Schema to Production
Once you have the `DATABASE_URL` set locally:
```bash
npx prisma db push
npx prisma generate
```

## 3. Setup Pusher (Real-time WebSockets)
1. Go to [Pusher Channels](https://pusher.com/channels).
2. Create a new app (e.g., `bacbuddy-prod`).
3. Select `Next.js` / `React` for the frontend and `Node.js` for the backend.
4. Go to App Keys and copy them into your `.env`:
   ```env
   PUSHER_APP_ID="your_app_id"
   NEXT_PUBLIC_PUSHER_KEY="your_key"
   PUSHER_SECRET="your_secret"
   NEXT_PUBLIC_PUSHER_CLUSTER="eu"
   ```

## 4. Auth.js Configuration
1. Generate a strong random secret using `openssl rand -base64 32`.
2. Add it to your `.env` as `NEXTAUTH_SECRET`.
3. Set `NEXTAUTH_URL` to your production domain once you have it.

## 5. Deploy to Vercel
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, paste all your `.env` variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `PUSHER_APP_ID`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
5. Click **Deploy**. Vercel will automatically detect Next.js and build the application.

## 6. Production Checklist
- [ ] Database migrated to Neon successfully.
- [ ] NextAuth secret is cryptographically secure.
- [ ] Pusher cluster matches your Vercel deployment region.
- [ ] Excalidraw canvas is loading without SSR warnings.
- [ ] Create a test room with a partner to verify WebSocket presence channels.
