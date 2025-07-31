import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 💰 Define service prices (match EXACTLY with booking page titles)
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

// 🔑 Replace this with your actual public key
const paystackPublicKey = "pk_test_e55447211d14449117dd9fa6662dd0a7fa8317a0";

// ✅ Sign in anonymously
signInAnonymously(auth)
  .then(() => console.log('✅ Signed in anonymously'))
  .catch((error) => console.error("❌ Anonymous login failed:", error));

// ✅ Wait for Paystack script to load
function waitForPaystack(callback) {
  const check = () => {
    if (window.PaystackPop) return callback();
    setTimeout(check, 300); // check every 300ms
  };
  check();
}

// ✅ Setup when user is authenticated
onAuthStateChanged(auth, user => {
  if (!user) return;

  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    bookingMsg.textContent = '⏳ Processing payment...';

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    const serviceTitle = document.title.replace('Book', '').split('–')[0].trim();
    const amountGHS = servicePrices[serviceTitle];

    if (!amountGHS) {
      bookingMsg.textContent = '❌ Unknown service price.';
      return;
    }

    const amountPES = amountGHS * 100; // GHS to pesewas

    waitForPaystack(() => {
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: `${phone}@amanfour.com`,
        amount: amountPES,
        currency: 'GHS',
        callback: async function(response) {
          try {
            await addDoc(collection(db, 'bookings'), {
              name,
              phone,
              service: serviceTitle,
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
});
