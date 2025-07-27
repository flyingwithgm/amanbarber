/* public/js/auth.js
   Handle login, register, logout, guard routes
*/
import { auth, db } from "./firebase.js";
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
const mainContent = document.getElementById("mainContent");
const logoutBtn = document.getElementById("logoutBtn");

// Handle form submission
if (authForm) {
  authForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = authForm.email.value.trim();
    const pass  = authForm.password.value;
    authMsg.textContent = "Processing...";

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      authMsg.textContent = "Login successful!";
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        try {
          await createUserWithEmailAndPassword(auth, email, pass);
          await setDoc(doc(db, "users", auth.currentUser.uid), { email });
          authMsg.textContent = "Account created and logged in!";
        } catch (signupError) {
          authMsg.textContent = "Error creating account: " + signupError.message;
        }
      } else {
        authMsg.textContent = "Login error: " + error.message;
      }
    }
  });
}

// Handle logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}

// Handle auth state changes
onAuthStateChanged(auth, user => {
  if (user) {
    authCard.hidden = true;
    mainContent.hidden = false;
  } else {
    authCard.hidden = false;
    mainContent.hidden = true;
  }
});
