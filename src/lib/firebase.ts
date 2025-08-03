// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDACaogDHWgZ5JPxZrH8wv5yI-Lr8RCMpc",
  authDomain: "erp-tao.firebaseapp.com",
  projectId: "erp-tao",
  storageBucket: "erp-tao.firebasestorage.app",
  messagingSenderId: "851828361488",
  appId: "1:851828361488:web:c89a617d9a771157937d95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
