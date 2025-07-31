// booking-gate.js
import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 👇 Service prices (in GHS)
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

// ✅ Your test public key from Paystack
const paystackPublicKey = "pk_test_9ebb74585748de848bd231ad79836e8d7b829acb";

signInAnonymously(auth)
  .then(() => console.log("🔐 Signed in anonymously"))
  .catch((error) => console.error("❌ Sign-in error:", error));

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "⏳ Processing payment...";

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;

    const price = servicePrices[service];
    if (!price) {
      msg.textContent = "❌ Unknown service price.";
      return;
    }

    const amountInPesewas = price * 100;

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: "georgemawutor3@gmail.com", // ✅ Real email
      amount: amountInPesewas,
      currency: "GHS",
      callback: async (response) => {
        try {
          await addDoc(collection(db, 'bookings'), {
            name,
            phone,
            date,
            time,
            service,
            price,
            payRef: response.reference,
            created: serverTimestamp()
          });
          msg.textContent = "✅ Payment successful & booking saved!";
          form.reset();
        } catch (err) {
          console.error("❌ Firestore error:", err);
          msg.textContent = "❌ Booking failed. Try again.";
        }
      },
      onClose: () => {
        msg.textContent = "❌ Payment was cancelled.";
      }
    });

    handler.openIframe();
  });
});
