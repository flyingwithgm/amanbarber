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

// Paystack Hosted Link
const paystackBaseUrl = "https://paystack.shop/pay/g8knxaxr4s";

// Sign in anonymously to Firebase
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error));

// Set up form submission
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

    const amountGHS = servicePrices[service];

    if (!amountGHS) {
      msg.textContent = '❌ Invalid service selected.';
      console.error("🚫 Service not found:", service);
      return;
    }

    const amountPesewas = amountGHS * 100;
    const ref = `AMAN-${Date.now()}`;
    const email = `${phone}@amanfour.com`;

    // Show status message
    msg.textContent = '⏳ Redirecting to Paystack...';

    // Optional: Save pending booking in Firestore
    try {
      await addDoc(collection(db, 'pendingBookings'), {
        name, phone, date, time, service,
        created: serverTimestamp(),
        status: 'pending',
        payRef: ref
      });
      console.log('✅ Pending booking saved');
    } catch (err) {
      console.error("❌ Failed to save pending booking:", err);
    }

    // Build the redirect URL
    const redirectUrl = `${paystackBaseUrl}?email=${encodeURIComponent(email)}&amount=${amountPesewas}&reference=${ref}`;

    // Redirect to hosted Paystack page
    window.location.href = redirectUrl;
  });
});
