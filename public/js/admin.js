// js/admin.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const tbody = document.querySelector('#bookingsTable tbody');
const logoutBtn = document.getElementById('logoutBtn');

// ----- MULTI-ADMIN LIST -----
const ADMINS = [
  'georgemawutor3@gmail.com',
  'Amanfourbarber72@gmail.com'
].map(e => e.toLowerCase());

onAuthStateChanged(auth, user => {
  if (!user || !ADMINS.includes(user.email?.toLowerCase())) {
    alert('Admin only.');
    signOut(auth);
    location.href = 'index.html';
    return;
  }

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
      alert('Could not load bookings. Check console.');
    }
  );
});

logoutBtn.onclick = () => signOut(auth).then(() => location.href = 'index.html');
