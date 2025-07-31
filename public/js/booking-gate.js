// js/booking-gate.js
import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🧠 Prices for each service
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

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb"; // ✅ Your test key

// 🔐 Sign in anonymously
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error));

// 🧠 Wait for auth to be ready before listening for form submit
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

    console.log("📥 Booking data:", { name, phone, date, time, service });

    const amountGHS = servicePrices[service];
    if (!amountGHS) {
      msg.textContent = '❌ Could not find price for selected service.';
      console.error("🚫 Invalid service name:", service);
      return;
    }

    const amountPesewas = amountGHS * 100;
    msg.textContent = '⏳ Launching payment page...';

    // ✅ Make sure Paystack is loaded
    if (typeof PaystackPop === 'undefined') {
      msg.textContent = '❌ Paystack failed to load.';
      console.error("🚫 PaystackPop not defined. Check if Paystack script is loading.");
      return;
    }

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`,
      amount: amountPesewas,
      currency: "GHS",
      ref: `AMAN-${Date.now()}`,
      callback: async function(response) {
        console.log("✅ Payment complete. Ref:", response.reference);
        try {
          await addDoc(collection(db, 'bookings'), {
            name,
            phone,
            date,
            time,
            service,
            created: serverTimestamp(),
            payRef: response.reference
          });
          msg.textContent = '✅ Booking successful & payment confirmed!';
          form.reset();
        } catch (err) {
          msg.textContent = '❌ Booking failed: ' + err.message;
          console.error("🚫 Firestore error:", err);
        }
      },
      onClose: function() {
        msg.textContent = '❌ Payment was cancelled.';
        console.warn("🚪 User closed Paystack.");
      }
    });

    console.log("🔁 Redirecting to Paystack...");
    handler.openRedirect(); // ✅ THIS FIXES PHONE ISSUES
  });
});
