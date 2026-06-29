# Deployment Instructions

Follow these step-by-step instructions to deploy the Sri Gowthami Educational Institutions Course & Program Information Portal to live URLs.

## BACKEND on Render

1. **Push all code** to a GitHub repository.
2. Go to **[render.com](https://render.com)**, click **New Web Service**, and connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set the **Build Command** to:
   ```bash
   npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
   ```
5. Set the **Start Command** to:
   ```bash
   node dist/server.js
   ```
6. Add the following **Environment Variables**:
   - `DATABASE_URL`: Set this to your PostgreSQL connection string. (Create a free PostgreSQL database on Render and copy the internal connection URL).
   - `GEMINI_API_KEY`: Add your Gemini API key (optional).
   - `NODE_ENV`: Set to `production`.
   - `PORT`: Set to `5000`.
7. Click **Deploy** and wait for the build to complete.
8. Copy the live Render service URL (e.g., `https://sgei-portal-backend.onrender.com`).

---

## FRONTEND on Netlify

1. Go to **[app.netlify.com](https://app.netlify.com)**, click **Add New Site**, and select **Import from Git**.
2. Connect your GitHub repository.
3. Set the build parameters:
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add the following **Environment Variable**:
   - `VITE_API_BASE_URL`: Set this to the backend Render URL copied from above (e.g., `https://sgei-portal-backend.onrender.com` without a trailing slash).
5. Click **Deploy**.

---

## VERIFY DEPLOYMENT

1. Open the Netlify live URL — the portal should load successfully and display the 18 seeded programs.
2. Submit a new enquiry on the live site — verify it saves to the production database and returns the admissions AI recommendation.
3. Open `https://your-render-url.onrender.com/health` — should return `{"status":"ok"}`.
4. Open `https://your-render-url.onrender.com/api/programs/stats` — should return `totalPrograms: 18`.
