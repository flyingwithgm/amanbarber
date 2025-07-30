import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const loginCard = document.getElementById('loginCard');
const loginForm = document.getElementById('loginForm');
const adminSection = document.getElementById('adminSection');
const logoutBtn = document.getElementById('logoutBtn');
const tbody = document.querySelector('#bookingsTable tbody');

// ----- MULTI-ADMIN LIST -----
const ADMINS = [
  'georgemawutor3@gmail.com',
  'Amanfourbarber72@gmail.com'
].map(e => e.toLowerCase());

// LOGIN LOGIC
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    if (!ADMINS.includes(user.email?.toLowerCase())) {
      alert("Access denied: not an admin.");
      await signOut(auth);
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// MONITOR AUTH STATE
onAuthStateChanged(auth, user => {
  if (user && ADMINS.includes(user.email?.toLowerCase())) {
    loginCard.hidden = true;
    adminSection.hidden = false;
    logoutBtn.hidden = false;

    const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));
    onSnapshot(q, snap => {
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
          <td>${b.phone || ''}</td>
        `;
        tbody.appendChild(tr);
      });
    }, err => {
      console.error('Error loading bookings:', err);
      alert('Could not load bookings. See console.');
    });

  } else {
    adminSection.hidden = true;
    logoutBtn.hidden = true;
  }
});

// LOGOUT
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    loginCard.hidden = false;
    adminSection.hidden = true;
    logoutBtn.hidden = true;
  });
};
