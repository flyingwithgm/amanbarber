window.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#bookingsTable tbody');
  const ADMIN_EMAIL = 'Amanfourbarber72@gmail.com';

  onAuthStateChanged(auth, user => {
    if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert('Admin only.');
      signOut(auth);
      location.href = 'index.html';
      return;
    }

    const q = query(collection(db, 'bookings'), orderBy('created', 'desc'));
    onSnapshot(q, snap => {
      tbody.innerHTML = '';
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
    });
  });
});
