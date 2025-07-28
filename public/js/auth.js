import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const authForm  = document.getElementById("authForm");
const authMsg   = document.getElementById("authMsg");
const authCard  = document.getElementById("authCard");
const bookCard  = document.getElementById("bookingCard");
const logoutBtn = document.getElementById("logoutBtn");

authForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = authForm.email.value.trim();
  const pass  = authForm.password.value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, "users", auth.currentUser.uid), { email });
  }
});

logoutBtn?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  if (user) {
    authCard && (authCard.hidden = true);
    bookCard && (bookCard.hidden = false);
    logoutBtn && (logoutBtn.hidden = false);
  } else {
    authCard && (authCard.hidden = false);
    bookCard && (bookCard.hidden = true);
    logoutBtn && (logoutBtn.hidden = true);
  }
});
