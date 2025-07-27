/* public/js/book.js
   Save booking to Firestore
*/
import { auth, db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
