// admin.js - With added error handling and logging

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
  orderBy,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🔐 DOM Elements
const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const adminDashboard = document.getElementById('adminDashboard');
const tbody = document.querySelector('#bookingsTable tbody'); // For confirmed bookings
const logoutBtn = document.getElementById('logoutBtn');
const momoInput = document.getElementById("momoInput");
const saveMomoBtn = document.getElementById("saveMomoBtn");
const momoStatus = document.getElementById("momoStatus");

// ✅ Admin email list
const ADMINS = [
  'georgemawutor3@gmail.com',
  'amanfourbarber72@gmail.com'
].map(email => email.toLowerCase());

// 🔐 LOGIN
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
    loadPendingBookings();
    loadMomoNumber();

  } catch (err) {
    console.error("Login Error:", err); // Log login errors
    alert("Login failed: " + err.message);
  }
});

// ✅ LOAD CONFIRMED BOOKINGS
function loadBookings() {
  // Check if tbody exists before proceeding
  if (!tbody) {
      console.error("ERROR: Could not find the main bookings table body (tbody).");
      return;
  }

  const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));
  onSnapshot(q, snapshot => {
    console.log("Loading confirmed bookings snapshot..."); // Debug log
    tbody.innerHTML = '';

    if (snapshot.empty) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align:center">No bookings yet</td>';
      tbody.appendChild(tr);
    } else {
      snapshot.forEach(doc => {
        try {
            const b = doc.data();
            console.log("Processing confirmed booking doc:", b); // Debug log
            const tr = document.createElement('tr');
            // Use template literals with error handling for each field
            tr.innerHTML = `
              <td>${b.name || 'N/A'}</td>
              <td>${b.service || 'N/A'}</td>
              <td>${b.date || 'N/A'}</td>
              <td>${b.time || 'N/A'}</td>
              <td>${b.phone || 'N/A'}</td>`;
            tbody.appendChild(tr);
        } catch (innerErr) {
            console.error("Error processing confirmed booking document:", innerErr, doc.data());
        }
      });
    }
  }, err => {
    console.error('Error loading confirmed bookings (onSnapshot):', err);
    alert('Could not load confirmed bookings. Check console.');
  });
}

// 🔁 LOAD PENDING BOOKINGS
function loadPendingBookings() {
  // Check if tbodyPending exists before proceeding
  const tbodyPending = document.querySelector('#pendingBookingsTable tbody');
  if (!tbodyPending) {
      console.error("ERROR: Could not find the pending bookings table body (tbody).");
      return;
  }

  const q = query(collection(db, 'pending_bookings'), orderBy('created', 'desc'));

  onSnapshot(q, snapshot => {
    console.log("Loading pending bookings snapshot..."); // Debug log
    tbodyPending.innerHTML = '';

    if (snapshot.empty) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" style="text-align:center">No pending bookings</td>';
      tbodyPending.appendChild(tr);
    } else {
      snapshot.forEach(docSnap => {
        try {
            const b = docSnap.data();
            console.log("Processing pending booking doc:", b); // Debug log - Check if name/phone are here
            const tr = document.createElement('tr');
            // Use template literals with error handling for each field
            tr.innerHTML = `
              <td>${b.name || 'N/A'}</td>
              <td>${b.service || 'N/A'}</td>
              <td>${b.date || 'N/A'}</td>
              <td>${b.time || 'N/A'}</td>
              <td>${b.phone || 'N/A'}</td>
              <td><button class="confirm-btn" data-id="${docSnap.id}">Confirm</button></td>
            `;
            tbodyPending.appendChild(tr);
        } catch (innerErr) {
            console.error("Error processing pending booking document:", innerErr, docSnap.data());
        }
      });

      // Re-attach event listeners after the table is updated
      document.querySelectorAll('.confirm-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await confirmBooking(id);
        });
      });
    }
  }, err => {
    console.error('Error loading pending bookings (onSnapshot):', err); // Log onSnapshot errors
    alert('Could not load pending bookings. Check console.');
  });
}


// 🟢 CONFIRM A BOOKING
async function confirmBooking(docId) {
  try {
    const docRef = doc(db, 'pending_bookings', docId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      alert("❌ Booking no longer exists.");
      return;
    }

    const booking = snapshot.data();
    console.log("Confirming booking:", booking); // Debug log

    await addDoc(collection(db, 'bookings'), {
      ...booking,
      confirmedAt: new Date()
    });

    await deleteDoc(docRef);

    alert('✅ Booking confirmed!');

  } catch (err) {
    console.error('❌ Confirm failed:', err);
    alert('Failed to confirm booking.');
  }
}

// ⚙️ LOAD MOMO NUMBER
async function loadMomoNumber() {
  try {
    const snap = await getDoc(doc(db, "settings", "momo"));
    if (snap.exists()) {
      momoInput.value = snap.data().number;
    } else {
        console.log("MoMo number settings document does not exist.");
    }
  } catch (err) {
    console.error("Failed to load MoMo number:", err);
  }
}

// 💾 SAVE MOMO NUMBER
saveMomoBtn?.addEventListener("click", async () => {
  try {
    await setDoc(doc(db, "settings", "momo"), {
      number: momoInput.value.trim()
    });
    momoStatus.textContent = "✅ MoMo number saved.";
  } catch (err) {
    momoStatus.textContent = "❌ Failed to save.";
    console.error(err);
  }
});

// 🚪 LOGOUT
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => location.reload());
});
