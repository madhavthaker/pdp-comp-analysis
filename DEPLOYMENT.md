# Deployment Guide 🚀

Deploy your PDP Competitive Analysis app to share with friends!

## Architecture

- **Frontend**: Next.js app → deploys to **Vercel** (free)
- **Backend**: FastAPI Python → deploys to **Railway** (free tier ~$5/month credit)

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easy deployments)

### 1.2 Deploy the Backend
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `pdp_competitive_analysis` repository
3. Railway will auto-detect the Python app

### 1.3 Configure Environment Variables
In Railway dashboard, go to your project → **Variables** tab → Add:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `FRONTEND_URL` | (Add after Vercel deploy, e.g., `https://your-app.vercel.app`) |

### 1.4 Get Your Backend URL
After deployment, go to **Settings** → **Networking** → **Generate Domain**

Your backend URL will look like: `https://pdp-competitive-analysis-production.up.railway.app`

**Save this URL** - you'll need it for the frontend!

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.2 Deploy the Frontend
1. Click **"Add New..."** → **"Project"**
2. Import your `pdp_competitive_analysis` repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Configure Environment Variables
Add this environment variable:

| Variable | Value |
|----------|-------|
| `BACKEND_URL` | Your Railway backend URL (e.g., `https://pdp-competitive-analysis-production.up.railway.app`) |

### 2.4 Deploy!
Click **Deploy** and wait for the build to complete.

Your app will be live at: `https://your-project.vercel.app`

---

## Step 3: Connect Everything

### Update Railway FRONTEND_URL
1. Go back to Railway dashboard
2. Add/update the `FRONTEND_URL` variable with your Vercel URL
3. Railway will auto-redeploy

---

## Quick Deploy Checklist ✅

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] `OPENAI_API_KEY` set in Railway
- [ ] Backend URL copied
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel (root: `frontend`)
- [ ] `BACKEND_URL` set in Vercel
- [ ] `FRONTEND_URL` updated in Railway
- [ ] Test the app! 🎉

---

## Troubleshooting

### "CORS Error" in browser console
- Make sure `FRONTEND_URL` is set correctly in Railway
- The URL should include `https://` and no trailing slash

### "500 Error" on analysis
- Check that `OPENAI_API_KEY` is set in Railway
- View Railway logs for detailed error messages

### Build fails on Vercel
- Ensure **Root Directory** is set to `frontend`
- Check that all dependencies are in `package.json`

### Backend not responding
- Check Railway logs for errors
- Verify the service is running (green status)
- Make sure the domain is generated in Settings → Networking

---

## Sharing with Friends 🎉

Once deployed, share your Vercel URL:
```
https://your-project.vercel.app
```

Your friends can use the app directly - no setup required!

---

## Cost Estimates

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Vercel** | Generous free tier | Unlimited for hobby projects |
| **Railway** | $5/month credit | Usually enough for light usage |
| **OpenAI** | Pay-as-you-go | ~$0.01-0.05 per analysis |

---

## Alternative: One-Click Deploy

### Deploy to Railway (Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Deploy to Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/pdp_competitive_analysis&root-directory=frontend)

*(Replace YOUR_USERNAME with your GitHub username after pushing to GitHub)*

