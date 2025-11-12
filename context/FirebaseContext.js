// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7bthkF8JjseKqOY5uaQPpU1-wtY-TisE",
  authDomain: "lab-equipment-c6a05.firebaseapp.com",
  projectId: "lab-equipment-c6a05",
  storageBucket: "lab-equipment-c6a05.firebasestorage.app",
  messagingSenderId: "297887199283",
  appId: "1:297887199283:web:8ad231be4d28479118f346",
  measurementId: "G-3BK2SEG9TM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
