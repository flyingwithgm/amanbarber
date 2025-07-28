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

// Create the auth section dynamically or use existing elements
const heroContent = document.querySelector(".hero-content");

// Add auth form to hero content if it doesn't exist
if (heroContent && !authForm) {
  const authFormHTML = `
    <div id="authSection" style="background: rgba(0,0,0,0.8); padding: 2rem; border-radius: 15px; margin-top: 2rem; max-width: 400px; margin-left: auto; margin-right: auto;">
      <h3 style="color: var(--gold); margin-bottom: 1rem;">Login or Register</h3>
      <form id="authForm">
        <input type="email" name="email" placeholder="Your Email" required style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: 1px solid var(--gold); background: var(--black); color: var(--white);">
        <input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: 1px solid var(--gold); background: var(--black); color: var(--white);">
        <button type="submit" class="btn-book-now" style="width: 100%; padding: 12px; margin: 10px 0;">Login / Register</button>
      </form>
      <p id="authMsg" style="color: #fff; text-align: center; margin-top: 1rem;"></p>
    </div>
  `;
  heroContent.insertAdjacentHTML('beforeend', authFormHTML);
}

// Get the form and message elements again after creating them
const updatedAuthForm = document.getElementById("authForm");
const updatedAuthMsg = document.getElementById("authMsg");

// Handle form submission
if (updatedAuthForm) {
  updatedAuthForm.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("Form submitted");
    
    const email = updatedAuthForm.email.value.trim();
    const pass  = updatedAuthForm.password.value;
    
    if (updatedAuthMsg) {
      updatedAuthMsg.textContent = "Processing...";
      updatedAuthMsg.style.color = "#fff";
    }

    try {
      console.log("Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      console.log("Login successful:", userCredential.user.email);
      if (updatedAuthMsg) {
        updatedAuthMsg.textContent = "Login successful!";
        updatedAuthMsg.style.color = "lightgreen";
      }
      // Hide auth form after successful login
      const authSection = document.getElementById("authSection");
      if (authSection) {
        authSection.style.display = "none";
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
          
          if (updatedAuthMsg) {
            updatedAuthMsg.textContent = "Account created and logged in!";
            updatedAuthMsg.style.color = "lightgreen";
          }
          // Hide auth form after successful signup
          const authSection = document.getElementById("authSection");
          if (authSection) {
            authSection.style.display = "none";
          }
        } catch (signupError) {
          console.error("Signup error:", signupError);
          if (updatedAuthMsg) {
            updatedAuthMsg.textContent = "Error: " + signupError.message;
            updatedAuthMsg.style.color = "red";
          }
        }
      } else {
        console.error("Auth error:", error);
        if (updatedAuthMsg) {
          updatedAuthMsg.textContent = "Error: " + error.message;
          updatedAuthMsg.style.color = "red";
        }
      }
    }
  });
}

// Handle auth state changes - show/hide services based on auth state
onAuthStateChanged(auth, user => {
  console.log("Auth state changed. User:", user ? user.email : "null");
  
  const servicesSection = document.getElementById("services");
  const bookNowButton = document.querySelector(".btn-book-now[href='#services']");
  
  if (user) {
    // User is logged in - show services, hide auth form
    console.log("User logged in, showing services");
    if (servicesSection) servicesSection.style.display = "block";
    const authSection = document.getElementById("authSection");
    if (authSection) authSection.style.display = "none";
    
    // Show a logout button
    if (!document.getElementById("logoutBtn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutBtn";
      logoutBtn.textContent = "Logout";
      logoutBtn.className = "btn-book-now";
      logoutBtn.style.marginTop = "1rem";
      logoutBtn.addEventListener("click", () => signOut(auth));
      document.querySelector(".hero-content").appendChild(logoutBtn);
    }
  } else {
    // No user - show auth form, hide services
    console.log("No user, showing auth form");
    if (servicesSection) servicesSection.style.display = "none";
    const authSection = document.getElementById("authSection");
    if (authSection) authSection.style.display = "block";
    
    // Remove logout button if it exists
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.remove();
  }
});
