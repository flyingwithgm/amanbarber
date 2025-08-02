import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Selar hosted links for each service
const paystackLinks = {
  "Regular Haircut": "https://selar.com/651yl1dr5h",
  "Beard Trim": "https://selar.com/p62i659593",
  "Cut + Enhancement": "https://selar.com/45616143u1",
  "Haircut + Texturizer": "https://selar.com/173104c117",
  "Pixie Cut": "https://selar.com/1s5p511653",
  "Extensions": "https://selar.com/394hp3g166",
  "Complete Color": "https://selar.com/66sm265764",
  "Part Color": "https://selar.com/211s41t961"
};

// Sign in anonymously to Firebase
signInAnonymously(auth)
  .then(() => console.log('✅ Firebase signed in anonymously'))
  .catch((error) => console.error("❌ Firebase anonymous login failed:", error.message));

// Handle booking form submission
onAuthStateChanged(auth, user => {
  if (!user) return;

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;
    const payUrl = paystackLinks[service];

    msg.textContent = '⏳ Saving your booking...';

    try {
      await addDoc(collection(db, 'bookings'), {
        name,
        phone,
        date,
        time,
        service,
        created: serverTimestamp()
      });

      msg.textContent = '✅ Booking saved! Redirecting to payment...';

      setTimeout(() => {
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          msg.textContent = '⚠️ No payment link found for this service.';
        }
      }, 2000);

    } catch (err) {
      msg.textContent = '❌ Failed to save booking: ' + err.message;
      console.error(err);
    }
  });
});
