// booking-gate.js
import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb"; // test key

signInAnonymously(auth)
  .then(() => {
    document.getElementById('bookingMsg').textContent = '✅ Signed in to Firebase';
  })
  .catch((error) => {
    document.getElementById('bookingMsg').textContent = '❌ Firebase sign-in failed: ' + error.message;
  });

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

    msg.textContent = '📥 Processing...';

    if (!name || !phone || !date || !time || !service) {
      msg.textContent = '❌ Missing required field.';
      return;
    }

    const amountGHS = servicePrices[service];

    if (!amountGHS) {
      msg.textContent = '❌ Unknown service: ' + service;
      return;
    }

    const amountPesewas = amountGHS * 100;

    if (typeof PaystackPop === 'undefined') {
      msg.textContent = '❌ PaystackPop not loaded!';
      return;
    }

    msg.textContent = '💵 Launching payment modal...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`,
      amount: amountPesewas,
      currency: "GHS",
      ref: `AMAN-${Date.now()}`,
      callback: async function(response) {
        msg.textContent = '✅ Payment done. Saving booking...';
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
          msg.textContent = '✅ Booking confirmed!';
          form.reset();
        } catch (err) {
          msg.textContent = '❌ Failed to save booking: ' + err.message;
        }
      },
      onClose: function() {
        msg.textContent = '❌ Payment was cancelled.';
      }
    });

    msg.textContent = '🟢 Opening Paystack...';
    handler.openIframe();
  });
});
