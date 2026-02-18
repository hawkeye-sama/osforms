# OSForms Guide: Total Privacy with Self-Hosting (Vercel & Railway)

The beauty of open source is that you don't have to trust our cloud. You can run OSForms on your own infrastructure in under 60 seconds.

**Why Self-Host?**
-   **Total Data Sovereignty:** Your submissions never touch our database.
-   **Custom Subdomains:** Run your form backend on `forms.yourcompany.com`.
-   **No Rate Limits:** You control the infrastructure, so you control the limits.

---

### Deployment Options

#### Option A: Vercel (The 1-Click Way)
Since OSForms is built with Next.js, it's a first-class citizen on Vercel.
1.  Fork the [OSForms Repo](https://github.com/hawkeye-sama/osforms).
2.  Import the project into Vercel.
3.  Add your Environment Variables (Database URL, Google Client ID, etc.).
4.  **Deploy.**

#### Option B: Railway / Docker
If you prefer a traditional server or Docker setup:
1.  Use our `docker-compose.yml` to spin up the app and a MongoDB instance.
2.  Set your `NEXTAUTH_URL` to your server's IP or domain.
3.  OSForms will be live on port 3000.

### Environment Variables Cheat-Sheet
To get a self-hosted instance running, you'll need:
-   `DATABASE_URL`: Your MongoDB connection string.
-   `GOOGLE_CLIENT_ID` & `SECRET`: For Google OAuth and Sheets sync.
-   `RESEND_API_KEY`: For system emails (OTP/Verification).
-   `NEXTAUTH_SECRET`: A random string for session security.

**Zero platform lock-in. Total control.**
