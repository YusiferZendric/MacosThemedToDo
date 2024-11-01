import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDN02A0Z9lCRbBeVsYpMuLlMrsQact8cSo",
    authDomain: "second-todo-a54d1.firebaseapp.com",
    projectId: "second-todo-a54d1",
    storageBucket: "second-todo-a54d1.firebasestorage.app",
    messagingSenderId: "16046214643",
    appId: "1:16046214643:web:f68a4a9619baf8b6e59686",
    measurementId: "G-WZ9LRJ96JY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);