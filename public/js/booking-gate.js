import { auth, db } from './firebase.js';
import {
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🎯 Service prices (exact names must match HTML)
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

// 🔐 Sign in anonymously
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch(err => console.error("❌ Firebase sign-in failed:", err));

// ⚡ After auth, attach form handler
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
    const service = document.getElementById('service').value.trim();

    const amountGHS = servicePrices[service];
    if (!amountGHS) {
      msg.textContent = '❌ Invalid service selected.';
      return;
    }

    const amountPesewas = amountGHS * 100;
    const ref = 'AMAN-' + Date.now();
    const email = `${phone}@amanfour.com`;

    msg.textContent = '⏳ Launching payment modal...';

    if (typeof PaystackPop === 'undefined') {
      msg.textContent = '❌ Paystack script not loaded.';
      return;
    }

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: amountPesewas,
      currency: "GHS",
      ref,
      onClose: () => {
        msg.textContent = '❌ Payment was cancelled.';
        console.warn("🚪 Paystack modal closed.");
      },
      callback: function (response) {
        msg.textContent = '✅ Payment successful! Saving booking...';

        addDoc(collection(db, 'bookings'), {
          name,
          phone,
          date,
          time,
          service,
          created: serverTimestamp(),
          payRef: response.reference
        })
        .then(() => {
          msg.textContent = '✅ Booking saved!';
          form.reset();
        })
        .catch(err => {
          msg.textContent = '❌ Booking save failed.';
          console.error(err);
        });
      }
    });

    try {
      handler.openIframe();

      // 🚨 Fallback redirect after 5 seconds (for Tecno/Itel browsers)
      setTimeout(() => {
        msg.textContent = '↪ Redirecting to Paystack...';
        window.location.href = `https://checkout.paystack.com/${ref}`;
      }, 5000);

    } catch (err) {
      console.error("❌ openIframe() error:", err);
      window.location.href = `https://checkout.paystack.com/${ref}`;
    }
  });
});
