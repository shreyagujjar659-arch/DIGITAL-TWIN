# LYRA — AI Digital Twin

Mobile-first AI companion and safety dashboard. The UI runs in demo mode until Firebase environment variables are configured.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`, add a Firebase Web App configuration, then enable Email/Password and Google providers in Firebase Authentication. Deploy `firestore.rules` with the Firebase CLI before connecting production data.

## Firebase boundary

`src/firebase.js` initializes Authentication, Firestore, and Storage only when all `VITE_FIREBASE_*` values are present. Keep AI processing, SOS escalation, FCM, scheduled reminders, weather API keys, and any privileged operations in Cloud Functions; never ship Admin credentials to the client.
