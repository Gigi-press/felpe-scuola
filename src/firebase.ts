import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Config del progetto felpescarti-as26-27
const firebaseConfig = {
  apiKey: "AIzaSyBWM8Ik7WWlYjn7XRW5hQnKptm4OrBVszo",
  authDomain: "felpescarti-as26-27.firebaseapp.com",
  projectId: "felpescarti-as26-27",
  storageBucket: "felpescarti-as26-27.firebasestorage.app",
  messagingSenderId: "730372682315",
  appId: "1:730372682315:web:256c227f461b1cc5b713ce",
  measurementId: "G-7QZSSME7VB"
};

let app: any, auth: any, db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn("Firebase config error, using memory fallback mode:", err);
}

export { auth, db };
