/* public/js/book.js
   Save booking to Firestore & handle every "Book" button
*/
import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

console.log("Book script loaded");

// Handle service selection from service cards
document.addEventListener('DOMContentLoaded', () => {
  const bookButtons = document.querySelectorAll('.btn-book-inline');
  console.log("Found book buttons:", bookButtons.length);
  
  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceValue = btn.dataset.value;
      console.log("Selected service:", serviceValue);
      
      const serviceSelect = document.getElementById('service');
      if (serviceSelect) {
        serviceSelect.value = serviceValue;
        // Scroll to booking form
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Handle form submission
  const bookingForm = document.getElementById("bookingForm");
  const msg = document.getElementById("bookingMsg");

  if (bookingForm && msg) {
    bookingForm.addEventListener("submit", async e => {
      e.preventDefault();
      console.log("Booking form submitted");
      
      if (!auth.currentUser) {
        msg.textContent = "Please login first";
        msg.style.color = "red";
        return;
      }

      const data = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        service: bookingForm.service.value,
        date: bookingForm.date.value,
        time: bookingForm.time.value,
        phone: bookingForm.phone.value,
        created: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "bookings"), data);
        msg.textContent = "✅ Booking saved! We'll see you then.";
        msg.style.color = "lightgreen";
        bookingForm.reset();
      } catch (error) {
        console.error("Booking error:", error);
        msg.textContent = "Error: " + error.message;
        msg.style.color = "red";
      }
    });
  }
});
