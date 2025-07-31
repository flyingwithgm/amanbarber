import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Define prices
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

// Your Paystack public key
const paystackPublicKey = "pk_test_e55447211d14449117dd9fa6662dd0a7fa8317a0";

// Sign in anonymously to Firebase
signInAnonymously(auth)
  .then(() => console.log('✅ Signed in anonymously'))
  .catch((error) => console.error("❌ Anonymous login failed:", error));

// Wait for Firebase auth
onAuthStateChanged(auth, user => {
  if (!user) return;

  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Get form data
    const name  = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date  = document.getElementById('date').value;
    const time  = document.getElementById('time').value;

    // Detect service name
    const rawTitle = document.title;
    const service = rawTitle.replace('Book', '').split('–')[0].trim();
    const amountGHS = servicePrices[service];

    // Price check
    if (!amountGHS) {
      bookingMsg.textContent = '❌ Unknown service or price. Please contact support.';
      return;
    }

    const amountPES = amountGHS * 100;

    // Paystack validation
    if (!window.PaystackPop) {
      bookingMsg.textContent = '❌ Paystack not loaded. Check your internet.';
      return;
    }

    bookingMsg.textContent = 'Processing payment...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: `${phone}@amanfour.com`, // dummy email for Paystack
      amount: amountPES,
      currency: 'GHS',
      callback: async function(response) {
        try {
          await addDoc(collection(db, 'bookings'), {
            name, phone, service, date, time,
            created: serverTimestamp(),
            payRef: response.reference
          });
          bookingMsg.textContent = '✅ Booking confirmed! Payment successful.';
          bookingForm.reset();
        } catch (err) {
          bookingMsg.textContent = '❌ Booking saved failed: ' + err.message;
        }
      },
      onClose: function() {
        bookingMsg.textContent = '❌ Payment cancelled.';
      }
    });

    handler.openIframe();
  });
});
