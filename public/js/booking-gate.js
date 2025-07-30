import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Unlock form after login
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass);
  }
  document.getElementById('loginCard').hidden = true;
  document.getElementById('bookingForm').hidden = false;
});

// Submit booking
document.getElementById('bookingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    name:    document.getElementById('name').value,
    phone:   document.getElementById('phone').value,
    service: document.title.replace('Book', '').split('–')[0].trim(),
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    created: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'bookings'), data);
    document.getElementById('bookingMsg').textContent = '✅ Booking saved!';
    document.getElementById('bookingForm').reset();
  } catch (err) {
    document.getElementById('bookingMsg').textContent = '❌ Booking failed: ' + err.message;
  }
});
