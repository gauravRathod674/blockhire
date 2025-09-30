# Firebase Setup Instructions for BlockHire App

## 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Enter project name: "blockhire-app"
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Click "Save"

## 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>)
4. Register app with name "BlockHire"
5. Copy the firebaseConfig object

## 5. Add Environment Variables to Vercel
Add these environment variables in your Vercel project settings:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## 6. Security Rules (Optional - for production)
In Firestore Database > Rules, update to:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Blockchain records - read only for authenticated users
    match /records/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add role-based access in production
    }
  }
}
\`\`\`

## 7. Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy!

## Notes:
- The app currently uses localStorage for demo purposes
- In production, replace localStorage with Firestore collections
- Add proper role-based access control for issuer functionality
- Consider adding email verification for new users
