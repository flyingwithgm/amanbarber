import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Service prices in GHS
const servicePrices = {
  "Regular Haircut": 100,
  "Beard Trim": 80,
  "Cut + Enhancement": 120,
  "Haircut + Texturizer": 180,
  "Pixie Cut": 250,
  "Extensions": 500,
  "Complete Color": 220,
  "Part Color": 180
};

// Paystack hosted link
const paystackBaseUrl = "https://paystack.shop/pay/g8knxaxr4s";

// Sign in anonymously to Firebase
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error));

// Wait until user is authenticated
onAuthStateChanged(auth, user => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value.trim();

    const amount = servicePrices[service];
    if (!amount) {
      msg.textContent = '❌ Invalid service selected.';
      return;
    }

    msg.textContent = '⏳ Saving booking...';

    try {
      await addDoc(collection(db, 'bookings'), {
        name,
        phone,
        date,
        time,
        service,
        created: serverTimestamp()
      });

      msg.textContent = '✅ Booking saved! Redirecting to payment...';

      // 🔁 Redirect to Paystack hosted payment link
      setTimeout(() => {
        window.location.href = paystackBaseUrl;
      }, 2000); // 2 second wait before redirect
    } catch (err) {
      msg.textContent = '❌ Failed to save booking: ' + err.message;
      console.error(err);
    }
  });
});
