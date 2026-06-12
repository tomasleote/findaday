# Deployment Guide

How to deploy Find A Day to Vercel and Firebase.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Vercel CLI](https://vercel.com/docs/cli) (optional)
- [Firebase CLI](https://firebase.google.com/docs/cli) (optional, only if using Firebase Hosting)

---

## Step 1: Set Up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable Realtime Database:
   - Select "Realtime Database" in the sidebar.
   - Click "Create Database" and follow the steps.
   - Choose a location and start in Test Mode. Apply the rules from `database.rules.json` in this project before going live.
3. Get the configuration:
   - Go to Project Settings → General.
   - Click the Web App icon to register your app.
   - Copy the `firebaseConfig` values. You will need them for the environment variables.

---

## Step 2: Environment Variables

Create a file named `.env.local` for local development, or add these keys to your deployment platform:

```bash
# Firebase frontend SDK (required)
REACT_APP_FIREBASE_API_KEY="AIzaSyA..."
REACT_APP_FIREBASE_AUTH_DOMAIN="find-a-day.firebaseapp.com"
REACT_APP_FIREBASE_DATABASE_URL="https://find-a-day-default-rtdb.firebaseio.com"
REACT_APP_FIREBASE_PROJECT_ID="find-a-day"
REACT_APP_FIREBASE_STORAGE_BUCKET="find-a-day.appspot.com"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="12345678"
REACT_APP_FIREBASE_APP_ID="1:12345678:web:abcdef1234"

# Google Places (optional, for location features)
REACT_APP_GOOGLE_PLACES_API_KEY="AIzaSyB..."

# Serverless email config (API/Nodemailer)
EMAIL_SERVICE="gmail"        # or your service of choice
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

---

## Step 3: Deploying to Vercel (Recommended)

Vercel picks up the serverless `/api` routes without extra configuration.

1. Push the code to GitHub/GitLab/Bitbucket.
2. Import the repository into Vercel.
3. Add all environment variables from Step 2.
4. Vercel detects the React build script and the `/api` folder automatically.
5. Deploy.

---

## Step 4: Deploying to Firebase Hosting

If you prefer to host both the app and functions on Firebase:

1. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   Choose Hosting, Realtime Database, and Functions.
2. Update `firebase.json` if needed (the project already contains one).
3. Deploy:
   ```bash
   firebase deploy
   ```

---

## Post-Deployment Checklist

- [ ] Apply the rules in `database.rules.json` to secure the Realtime Database.
- [ ] Test group creation and confirm `/api/send-welcome` emails are delivering.
- [ ] Check that the Google Places dropdown works in production (requires billing and an authorized domain in Google Cloud).
- [ ] Confirm that recovering an admin link via email works.

---

## Security Notes

- Restrict your API keys in the Google Cloud Console to your domain only.
- For higher email volume, switch from Gmail App Passwords to a provider like SendGrid or Resend.
- Back up the Realtime Database periodically using Firebase scheduled backups.
