import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const adminDashboard = document.getElementById('adminDashboard');
const tbody = document.querySelector('#bookingsTable tbody');
const logoutBtn = document.getElementById('logoutBtn');

const ADMINS = [
  'georgemawutor3@gmail.com',
  'Amanfourbarber72@gmail.com'
].map(email => email.toLowerCase());

// LOGIN FORM SUBMIT
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    if (!ADMINS.includes(user.email.toLowerCase())) {
      alert("You're not an authorized admin.");
      await signOut(auth);
      return;
    }

    loginCard.hidden = true;
    adminDashboard.hidden = false;
    logoutBtn.hidden = false;
    loadBookings();

  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// LOAD BOOKINGS
function loadBookings() {
  const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));
  onSnapshot(q, snapshot => {
    tbody.innerHTML = '';

    if (snapshot.empty) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align:center">No bookings yet</td>';
      tbody.appendChild(tr);
    } else {
      snapshot.forEach(doc => {
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
    }
  }, err => {
    console.error('Error loading bookings:', err);
    alert('Could not load bookings. Check console.');
  });
}

// LOGOUT
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => location.reload());
});
