import { auth, db } from './firebase.js';
import {
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb";

signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch(err => console.error("❌ Firebase sign-in failed:", err));

onAuthStateChanged(auth, user => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;

    const prices = {
      "Regular Haircut": 100,
      "Beard Trim": 80,
      "Cut + Enhancement": 120,
      "Haircut + Texturizer": 180,
      "Pixie Cut": 250,
      "Extensions": 500,
      "Complete Color": 220,
      "Part Color": 180
    };

    const amountGHS = prices[service];
    const amountPesewas = amountGHS * 100;
    const ref = 'AMAN-' + Date.now();

    if (!amountGHS) {
      msg.textContent = '❌ Service not found.';
      return;
    }

    msg.textContent = '⏳ Launching payment modal...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`,
      amount: amountPesewas,
      currency: "GHS",
      ref,
      callback: function (response) {
        msg.textContent = '✅ Payment successful! Saving booking...';

        addDoc(collection(db, 'bookings'), {
          name, phone, date, time, service,
          payRef: response.reference,
          created: serverTimestamp()
        }).then(() => {
          msg.textContent = '✅ Booking saved!';
          form.reset();
        }).catch(err => {
          msg.textContent = '❌ Failed to save booking.';
          console.error(err);
        });
      },
      onClose: function () {
        msg.textContent = '❌ Payment was cancelled.';
      }
    });

    handler.openIframe(); // 👈 Run FIRST, then save in background
  });
});
