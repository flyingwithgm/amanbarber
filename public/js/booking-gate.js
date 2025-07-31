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

const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb";

signInAnonymously(auth)
  .then(() => console.log('Signed in anonymously'))
  .catch((error) => console.error("Anonymous login failed:", error));

onAuthStateChanged(auth, user => {
  if (!user) return;

  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value.trim();

    const amountGHS = servicePrices[service];
    if (!amountGHS) {
      bookingMsg.textContent = '❌ Unknown service price.';
      return;
    }

    bookingMsg.textContent = '⏳ Processing payment...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@demo.com`,
      amount: amountGHS * 100,
      currency: 'GHS',
      callback: async function(response) {
        try {
          await addDoc(collection(db, 'bookings'), {
            name,
            phone,
            service,
            date,
            time,
            created: serverTimestamp(),
            payRef: response.reference
          });
          bookingMsg.textContent = '✅ Booking confirmed & payment successful!';
          bookingForm.reset();
        } catch (err) {
          bookingMsg.textContent = '❌ Booking failed: ' + err.message;
        }
      },
      onClose: function() {
        bookingMsg.textContent = '❌ Payment cancelled.';
      }
    });

    handler.openIframe();
  });
});
