import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6BFTTa3kOp-zM-bgknRanrCcNdNNHsB0",
    authDomain: "openclaw-saas-a74c2.firebaseapp.com",
    projectId: "openclaw-saas-a74c2",
    storageBucket: "openclaw-saas-a74c2.firebasestorage.app",
    messagingSenderId: "49516954492",
    appId: "1:49516954492:web:b477626c021b1fe29ddaf9",
    measurementId: "G-Y1D7BM208P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getFirestore } from "firebase/firestore";

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
