# Deployment Guide - Course & Program Information Portal

Follow these step-by-step instructions to deploy the Sri Gowthami Educational Institutions Course & Program Information Portal to live hosting environments.

---

## 1. Deploy the Node.js Express Backend to Render

1. **Push Code to GitHub**:
   - Push your course portal repository code to a GitHub repository.

2. **Set up Web Service on Render**:
   - Navigate to [Render](https://render.com/) and log in.
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository containing the project.

3. **Configure Settings**:
   - **Name**: `sgei-portal-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `cd backend && node dist/server.js`

4. **Add Environment Variables**:
   Under the **Environment** tab, click **Add Environment Variable** and specify:
   - `DATABASE_URL`: Connection string (e.g., PostgreSQL connection string or persistent SQLite storage path).
   - `GEMINI_API_KEY`: Your Gemini Developer API Key.
   - `PORT`: `5000`

5. **Deploy**:
   - Click **Deploy Web Service** and await completion.
   - Once success is shown, copy the provided Render live URL (e.g. `https://sgei-portal-backend.onrender.com`).

---

## 2. Configure and Deploy the Frontend to Netlify

1. **Verify Backend Base URL**:
   - In `frontend/src/App.tsx`, verify that the `API_BASE_URL` resolves to your copied Render URL when in production mode.

2. **Build Frontend Bundle**:
   - Run the production build command inside the `frontend/` directory to generate the static files:
     ```bash
     cd frontend
     npm install
     npm run build
     ```
   - This creates a distribution folder named `dist` (or `build`).

3. **Deploy to Netlify**:
   - Navigate to [Netlify Drop](https://app.netlify.com/drop).
   - Drag and drop your compiled `frontend/dist` folder onto the browser drop zone.
   - Netlify will instantly host the static assets and generate a live URL.

---

## 3. Post-Deployment Verification

1. Access your live Netlify frontend URL.
2. Navigate across all 7 pages (*Home, Courses, Eligibility, Fees, Admission, Enquiry, FAQ*) to verify layout consistency.
3. Submit a test candidate enquiry form:
   - Verify client validations trigger on invalid inputs.
   - Verify the 1.5s loader spinner runs on submit.
   - Confirm the success celebration screen (`🎉`) renders and displays the AI recommendations fetched from the backend.
4. Update the live URL placeholders in `README.md` with your active links.
