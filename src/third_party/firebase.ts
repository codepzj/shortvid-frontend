// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDl03Z3dV4O3k0sfky42whQ9yKsFNr-POc",
  authDomain: "shortvid-3f800.firebaseapp.com",
  projectId: "shortvid-3f800",
  storageBucket: "shortvid-3f800.firebasestorage.app",
  messagingSenderId: "923156622417",
  appId: "1:923156622417:web:c51312bf66dfbe2810dc70",
  measurementId: "G-M1SC9CMNJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();