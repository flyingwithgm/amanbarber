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

const paystackPublicKey = "pk_test_e55447211d14449117dd9fa6662dd0a7fa8317a0";

// Sign in anonymously
signInAnonymously(auth)
  .then(() => console.log('Signed in anonymously'))
  .catch((error) => console.error("Anonymous login failed:", error));

onAuthStateChanged(auth, user => {
  if (!user) return;

  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();

    bookingMsg.textContent = "Processing payment...";

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Get service from the page title
    const service = document.title.replace('Book', '').split('–')[0].trim();
    const amountGHS = servicePrices[service];

    if (!amountGHS) {
      bookingMsg.textContent = '❌ Unknown service selected.';
      return;
    }

    const amountPES = amountGHS * 100;

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`, // dummy email for Paystack
      amount: amountPES,
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
          bookingMsg.textContent = '✅ Booking confirmed and payment successful!';
          bookingForm.reset();
        } catch (err) {
          bookingMsg.textContent = '❌ Booking saved failed: ' + err.message;
        }
      },
      onClose: function() {
        bookingMsg.textContent = '❌ Payment was cancelled.';
      }
    });

    handler.openIframe();
  });
});
