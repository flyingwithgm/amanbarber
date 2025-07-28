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

console.log("Auth script loaded");

const authForm  = document.getElementById("authForm");
const authMsg   = document.getElementById("authMsg");
const authCard  = document.getElementById("authCard");
const mainContent = document.getElementById("mainContent");
const logoutBtn = document.getElementById("logoutBtn");

console.log("Elements found:", {
  authForm: !!authForm,
  authMsg: !!authMsg,
  authCard: !!authCard,
  mainContent: !!mainContent,
  logoutBtn: !!logoutBtn
});

// Handle form submission
if (authForm) {
  authForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("Form submitted");
    
    const email = authForm.email.value.trim();
    const pass  = authForm.password.value;
    
    if (authMsg) {
      authMsg.textContent = "Processing...";
      authMsg.style.color = "#fff";
    }

    try {
      console.log("Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      console.log("Login successful:", userCredential.user.email);
      if (authMsg) {
        authMsg.textContent = "Login successful!";
        authMsg.style.color = "lightgreen";
      }
    } catch (error) {
      console.log("Login error:", error.code, error.message);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        try {
          console.log("Creating new account for:", email);
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          console.log("Account created:", userCredential.user.email);
          
          await setDoc(doc(db, "users", userCredential.user.uid), { 
            email: userCredential.user.email,
            createdAt: new Date()
          });
          
          if (authMsg) {
            authMsg.textContent = "Account created and logged in!";
            authMsg.style.color = "lightgreen";
          }
        } catch (signupError) {
          console.error("Signup error:", signupError);
          if (authMsg) {
            authMsg.textContent = "Error: " + signupError.message;
            authMsg.style.color = "red";
          }
        }
      } else {
        console.error("Auth error:", error);
        if (authMsg) {
          authMsg.textContent = "Error: " + error.message;
          authMsg.style.color = "red";
        }
      }
    }
  });
}

// Handle logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    console.log("Logout clicked");
    signOut(auth);
  });
}

// Handle auth state changes
onAuthStateChanged(auth, user => {
  console.log("Auth state changed. User:", user ? user.email : "null");
  
  if (user) {
    console.log("User logged in, showing main content");
    if (authCard) authCard.hidden = true;
    if (mainContent) mainContent.hidden = false;
  } else {
    console.log("No user, showing auth form");
    if (authCard) authCard.hidden = false;
    if (mainContent) mainContent.hidden = true;
  }
});
