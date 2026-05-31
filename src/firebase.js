import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhFjWajVtD49IfIILdFvCTIsLwXEUzjOs",
  authDomain: "truthlens-ab1d8.firebaseapp.com",
  projectId: "truthlens-ab1d8",
  storageBucket: "truthlens-ab1d8.firebasestorage.app",
  messagingSenderId: "560568712549",
  appId: "1:560568712549:web:e134364db63e94a8f5358c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);