import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXujkMmnDJw_p3IH3OuFde2_u2eABfNZE",
  authDomain: "land-measurement-app-201d6.firebaseapp.com",
  projectId: "land-measurement-app-201d6",
  storageBucket: "land-measurement-app-201d6.firebasestorage.app",
  messagingSenderId: "590899689542",
  appId: "1:590899689542:web:2abba7b5cab2618ce37247",
  measurementId: "G-K0TPNPKRCL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
