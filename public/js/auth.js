import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const authForm  = document.getElementById("authForm");
const bookingForm = document.getElementById("bookingForm");

authForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass  = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", auth.currentUser.uid), { email });
  }
  authForm.parentElement.hidden = true;
  bookingForm.hidden = false;
});
