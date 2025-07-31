// js/booking-gate.js
import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 🧠 Match exactly what's in the HTML
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

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb"; // 👈 your test key

signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error));

onAuthStateChanged(auth, user => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;

    const amountGHS = servicePrices[service];

    if (!amountGHS) {
      msg.textContent = '❌ Could not find price for selected service.';
      console.error("Service mismatch:", service);
      return;
    }

    const amountPesewas = amountGHS * 100;

    msg.textContent = '⏳ Processing payment...';
    console.log({ name, phone, date, time, service, amountGHS });

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`,
      amount: amountPesewas,
      currency: "GHS",
      callback: async function(response) {
        try {
          await addDoc(collection(db, 'bookings'), {
            name, phone, date, time, service,
            created: serverTimestamp(),
            payRef: response.reference
          });
          msg.textContent = '✅ Booking successful & payment confirmed!';
          form.reset();
        } catch (err) {
          msg.textContent = '❌ Booking failed to save: ' + err.message;
          console.error(err);
        }
      },
      onClose: function() {
        msg.textContent = '❌ Payment was cancelled.';
      }
    });

    handler.openIframe();
  });
});
