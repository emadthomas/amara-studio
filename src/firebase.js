// 1. Go to https://console.firebase.google.com and create a free project.
// 2. Inside the project, click the "</>" (Web) icon to register a web app.
// 3. Firebase will show you a config object like the one below — copy your
//    real values in here, replacing the placeholders.
// 4. Enable "Firestore Database" and "Storage" from the left sidebar
//    (Build > Firestore Database > Create database, and Build > Storage > Get started).
// See the README for full step-by-step instructions.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
