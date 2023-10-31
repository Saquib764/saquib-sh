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
let firebaseConfig = {
  apiKey: "AIzaSyDuafA7N_lSodjGgegcjvQADXrTqwltqkc",
  authDomain: "zust.ai",
  databaseURL: 'zust-ai.us-central.firebasedatabase.app',
  projectId: "zust-ai",
  storageBucket: "zust-ai.appspot.com",
  messagingSenderId: "1080199613909",
  appId: "1:1080199613909:web:3de48cc6c4a330fc64c15c",
  measurementId: "G-S7P0T8EHGE"
};

if(import.meta.env.VITE_APP_NAME == 'QR') {
  firebaseConfig = {
    apiKey: "AIzaSyARFQsvjxSlns0UWgfXaMEuEPCdcwDcQMQ",
    authDomain: "zust.ai",
    // authDomain: "zust-ai.firebaseapp.com",
    databaseURL: 'zust-ai.us-central.firebasedatabase.app',
    projectId: "zust-ai",
    storageBucket: "zust-ai.appspot.com",
    messagingSenderId: "1080199613909",
    appId: "1:1080199613909:web:289908c881fee35864c15c",
    measurementId: 'G-GDLSJB1Z64'
  };
}
if(import.meta.env.VITE_APP_NAME == 'photoshift') {
  firebaseConfig = {
    apiKey: "AIzaSyDuafA7N_lSodjGgegcjvQADXrTqwltqkc",
    authDomain: "zust-ai.firebaseapp.com",
    databaseURL: 'zust-ai.us-central.firebasedatabase.app',
    projectId: "zust-ai",
    storageBucket: "zust-ai.appspot.com",
    messagingSenderId: "1080199613909",
    appId: "1:1080199613909:web:04aeecca8e8e30a464c15c",
    measurementId: "G-WYHK7FWSK2"
  };
}

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

