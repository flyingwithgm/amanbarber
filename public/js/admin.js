// js/admin.js
import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const tbody = document.querySelector('#bookingsTable tbody');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('adminLogin');
const loginMsg = document.getElementById('loginMsg');
const dashboard = document.getElementById('dashboard');
const loginCard = document.getElementById('loginCard');

// Admin emails (lowercased)
const ADMINS = [
  'georgemawutor3@gmail.com',
  'amanfourbarber72@gmail.com'
].map(e => e.toLowerCase());

// Handle login
loginForm.onsubmit = async e => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const pass  = document.getElementById('adminPass').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const userEmail = userCred.user.email.toLowerCase();

    if (!ADMINS.includes(userEmail)) {
      loginMsg.textContent = '❌ Not an authorized admin.';
      await signOut(auth);
      return;
    }

    loginCard.hidden = true;
    dashboard.hidden = false;
    logoutBtn.hidden = false;
    loginMsg.textContent = '';

  } catch (err) {
    loginMsg.textContent = '❌ Login failed: ' + err.message;
  }
};

// Watch for auth and load bookings
onAuthStateChanged(auth, user => {
  if (!user || !ADMINS.includes(user.email?.toLowerCase())) return;

  const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));

  onSnapshot(
    q,
    snap => {
      tbody.innerHTML = '';
      if (snap.empty) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" style="text-align:center">No bookings yet</td>';
        tbody.appendChild(tr);
        return;
      }

      snap.forEach(doc => {
        const b = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.name || ''}</td>
          <td>${b.service || ''}</td>
          <td>${b.date || ''}</td>
          <td>${b.time || ''}</td>
          <td>${b.phone || ''}</td>`;
        tbody.appendChild(tr);
      });
    },
    err => {
      console.error('Admin bookings error:', err);
      alert('❌ Could not load bookings. Check console.');
    }
  );
});

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    location.reload();
  });
};
