import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBpf21PXIicMMdnXL2WKQHlYrVrNgG8P70",
  authDomain: "amaradio-stu.firebaseapp.com",
  projectId: "amaradio-stu",
  storageBucket: "amaradio-stu.firebasestorage.app",
  messagingSenderId: "839087336494",
  appId: "1:839087336494:web:553e540701dd36388f83bf",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);