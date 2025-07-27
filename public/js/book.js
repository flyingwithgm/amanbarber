/* public/js/book.js
   Save booking to Firestore & handle every “Book” button
*/
import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

/* Handle every inline “Book” button under thumbnails */
document.querySelectorAll('.btn-book-inline').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const sel=document.getElementById('service');
    sel.value=btn.dataset.service;
    sel.dispatchEvent(new Event('change'));
    document.getElementById('booking').scrollIntoView({behavior:'smooth'});
  });
});

/* Main booking flow */
const bookingForm = document.getElementById("bookingForm");
const msg         = document.getElementById("bookingMsg");

bookingForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    uid:     auth.currentUser.uid,
    email:   auth.currentUser.email,
    service: bookingForm.service.value,
    date:    bookingForm.date.value,
    time:    bookingForm.time.value,
    phone:   bookingForm.phone.value,
    created: serverTimestamp()
  };
  await addDoc(collection(db, "bookings"), data);
  msg.textContent = "✅ Booking saved! We’ll see you then.";
  bookingForm.reset();
});
