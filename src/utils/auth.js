import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config here - replace with your actual values
const firebaseConfig = {
    apiKey: "AIzaSyAne9AElJgMtFi1eH4nlxIvUIEKHfnvSPU",
    authDomain: "setpad-01.firebaseapp.com",
    projectId: "setpad-01",
    storageBucket: "setpad-01.firebasestorage.app",
    messagingSenderId: "1076820882523",
    appId: "1:1076820882523:web:0d8abd5b4ed725cbb3bb7e",
    measurementId: "G-VEEKR96GZD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to get user + token
export async function getFirebaseUserAndToken() {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { user, token };
} 