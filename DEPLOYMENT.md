# Deployment Guide (Free Hosting Ecosystem)

This guide takes you through deploying the Land Measurement Web Application with 100% free hosting.

## Frontend (Vercel)
Vercel offers the simplest, most performant deployment specifically optimized for Vite/React applications.
1. Create a free account at [Vercel](https://vercel.com/) via GitHub.
2. Push your `land-measurement-app` to a GitHub repository.
3. In Vercel, securely **Import** your repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Add your environment variables in Vercel settings (e.g., `VITE_FIREBASE_API_KEY`, etc. if moved to `.env`).
7. Click **Deploy**. Vercel will auto-provide a free SSL URL.

## Backend (Render)
Render offers an excellent free tier for Node.js Express APIs.
1. Create a free account at [Render](https://render.com/).
2. Create a new **Web Service**.
3. Connect your GitHub repository. 
4. Set Root Directory to `backend`.
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. In the **Environment Settings**, paste the contents of your backend `.env` file (ensure `MONGODB_URI` contains the real password).
8. Click **Deploy**. Note: Render free tier spins down after 15 mins of inactivity, which is fine for zero-budget MVP usage.

## Database (MongoDB Atlas Free Tier)
1. In MongoDB Atlas, go to **Network Access**.
2. Add IP Address `0.0.0.0/0` to allow the Render backend to connect.
3. Go to **Database Access** to ensure you have a standard read/write user.

## Important Mentoring Tip for Founders
> Always keep your `.env` variables **off** GitHub. I have explicitly `.gitignore`'d them.
> The PWA will automatically prompt users on Android to "Add to Homescreen" turning it into an installable native-like app bypassing the App Store.

Enjoy your shiny new tool. Next steps are generating standard icons for the PWA manifest!
