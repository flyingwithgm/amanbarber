// js/booking-gate.js
import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🧠 Match exactly what's in the HTML (no extra spaces!)
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

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb"; // ✅ test key

// 🔐 Sign in anonymously to Firebase
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error));

// ⏳ Wait for auth before setting up form
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

    console.log("📥 Form Data:", { name, phone, date, time, service });

    const amountGHS = servicePrices[service];

    if (!amountGHS) {
      msg.textContent = '❌ Could not find price for selected service.';
      console.error("🚫 Service mismatch or typo:", service);
      return;
    }

    const amountPesewas = amountGHS * 100;
    msg.textContent = '⏳ Processing payment...';
    console.log("💵 Launching Paystack with:", { amountGHS, amountPesewas });

    if (typeof PaystackPop === 'undefined') {
      msg.textContent = '❌ Paystack failed to load.';
      console.error("🚫 PaystackPop is not defined. Make sure the Paystack script loads before this JS.");
      return;
    }

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`, // used for tracking only
      amount: amountPesewas,
      currency: "GHS",
      ref: `AMAN-${Date.now()}`, // unique ref
      callback: async function(response) {
        console.log("✅ Payment successful! Ref:", response.reference);

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
          msg.textContent = '❌ Booking failed to save: ' + err.message;
          console.error("🚫 Firestore error:", err);
        }
      },
      onClose: function() {
        msg.textContent = '❌ Payment was cancelled.';
        console.warn("🚪 User closed the Paystack modal.");
      }
    });

    console.log("🟢 Launching Paystack iframe now...");
    handler.openIframe();
  });
});
