// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { GOOGLE_ANALYTICS_ID } from "./constants/firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBSQjAuzzFtRdUDNi3TUG-8LZj3DWO7_0M",
  authDomain: "saquib-sh.firebaseapp.com",
  databaseURL: 'saquib-sh.us-central.firebasedatabase.app',
  projectId: "saquib-sh",
  storageBucket: "saquib-sh.appspot.com",
  messagingSenderId: "1070726325724",
  appId: "1:1070726325724:web:33970d1e6116fe257adb19",
  measurementId: "G-0MH0NPZ0H8"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
if (process.client) {
  analytics = getAnalytics(app);
}
export const storage = getStorage(app)
export const db = getFirestore(app);

export const auth = getAuth()

export function logCurrentScreen(screenName){
  if(!analytics) return
  logEvent(analytics, 'screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenName,
  })
}

