/* public/js/admin.js
   Live admin dashboard
*/
import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const tbody     = document.querySelector("#bookingsTable tbody");
const logoutBtn = document.getElementById("logoutBtn");

const ADMIN_EMAIL = "amanbarber2025@gmail.com"; // <-- change to your admin email

logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Admin only. Logging out.");
    signOut(auth);
    location.href = "index.html";
    return;
  }

  onSnapshot(query(collection(db, "bookings"), orderBy("created", "desc")), snap => {
    tbody.innerHTML = "";
    snap.forEach(doc => {
      const b = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.email}</td>
        <td>${b.service}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>${b.phone}</td>`;
      tbody.appendChild(tr);
    });
  });
});
