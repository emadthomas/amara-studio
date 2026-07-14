// 1. Go to https://console.firebase.google.com and create a free project.
// 2. Inside the project, click the "</>" (Web) icon to register a web app.
// 3. Firebase will show you a config object like the one below — copy your
//    real values in here, replacing the placeholders.
// 4. Enable "Firestore Database" and "Storage" from the left sidebar
//    (Build > Firestore Database > Create database, and Build > Storage > Get started).
// See the README for full step-by-step instructions.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpf21PXIicMMdnXL2WKQHlYrVrNgG8P70",
  authDomain: "amaradio-stu.firebaseapp.com",
  projectId: "amaradio-stu",
  storageBucket: "amaradio-stu.firebasestorage.app",
  messagingSenderId: "839087336494",
  appId: "1:839087336494:web:553e540701dd36388f83bf",
  measurementId: "G-PYQ71CYYDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);