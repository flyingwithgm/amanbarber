import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCybqVlasAj69x6EljSlJJXavFJorN-csU",
  authDomain: "aman-barber.firebaseapp.com",
  projectId: "aman-barber",
  storageBucket: "aman-barber.appspot.com", // ✅ FIXED
  messagingSenderId: "146331198998",
  appId: "1:146331198998:web:9d2fe984b2d6033127f737"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
