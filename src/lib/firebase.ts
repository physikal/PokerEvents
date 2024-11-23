import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnpb-vWdoAlYOtmuCa6xTyMPB5qJ6Su6o",
  authDomain: "pokerevents-3639d.firebaseapp.com",
  projectId: "pokerevents-3639d",
  storageBucket: "pokerevents-3639d.firebasestorage.app",
  messagingSenderId: "1014173670966",
  appId: "1:1014173670966:web:d67c88a4d3c6edd735c297"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider with additional OAuth scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters for the Google sign-in flow
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // This ensures a new window opens for auth instead of a redirect
  display: 'popup'
});

export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not supported by browser');
  }
});