import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// 💰 Hardcoded service prices
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

// Firebase anonymous sign-in
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error.message));

// Booking form logic
onAuthStateChanged(auth, user => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');
  const serviceSelect = document.getElementById('service');

  // Live price preview when service is selected
  serviceSelect?.addEventListener('change', () => {
    const selectedService = serviceSelect.value;
    const price = servicePrices[selectedService];
    if (price) {
      msg.innerHTML = `💸 Selected service: <strong>${selectedService}</strong> – GHS ${price}`;
    } else {
      msg.textContent = '';
    }
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;
    const amount = servicePrices[service] || 0;

    // Get MoMo number from Firestore
    const momoSnap = await getDoc(doc(db, "settings", "momo"));
    const momoNumber = momoSnap.exists() ? momoSnap.data().number : '0598374336';

    msg.innerHTML = `
      ✅ Please send <strong>GHS ${amount}</strong> to MTN MoMo number:
      <strong>${momoNumber}</strong><br>
      Then tap the “I’ve Paid” button below to confirm.
      <br><br>
      <button id="confirmPaid" class="confirm-button">I’ve Paid</button>
    `;

    // Wait for "I’ve Paid" button
    setTimeout(() => {
      const confirmBtn = document.getElementById('confirmPaid');

      confirmBtn?.addEventListener('click', async () => {
        msg.textContent = '⏳ Verifying and saving your booking...';

        try {
          await addDoc(collection(db, 'pending_bookings'), {
            name,
            phone,
            date,
            time,
            service,
            amount,
            momoNumber,
            status: 'pending',
            created: serverTimestamp()
          });

          msg.textContent = '✅ Booking request received! We’ll confirm once payment is verified.';
          form.reset();

        } catch (err) {
          msg.textContent = '❌ Failed to save booking: ' + err.message;
          console.error(err);
        }
      });
    }, 100);
  });
});
