import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Sign in user anonymously
signInAnonymously(auth)
  .then(() => console.log('Signed in anonymously'))
  .catch((error) => console.error("Anonymous login failed:", error));

// When auth is ready, enable the booking
onAuthStateChanged(auth, user => {
  if (user) {
    const bookingForm = document.getElementById('bookingForm');
    const bookingMsg = document.getElementById('bookingMsg');

    bookingForm.addEventListener('submit', async e => {
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
        bookingMsg.textContent = '✅ Booking saved!';
        bookingForm.reset();
      } catch (err) {
        bookingMsg.textContent = '❌ Booking failed: ' + err.message;
      }
    });
  } else {
    console.warn("User not authenticated.");
  }
});
