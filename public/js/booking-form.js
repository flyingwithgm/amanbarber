import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

/* Pre-select service from URL */
const urlParams = new URLSearchParams(location.search);
const wanted = decodeURIComponent(urlParams.get('service') || '');
const sel = document.getElementById('service');
[...sel.options].forEach(opt => {
  if (opt.text === wanted) opt.selected = true;
});

/* Submit form */
document.getElementById('bookingForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const data = {
    uid:     auth.currentUser.uid,
    email:   auth.currentUser.email,
    service: sel.value,
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    phone:   document.getElementById('phone').value,
    created: serverTimestamp()
  };
  await addDoc(collection(db, 'bookings'), data);
  document.getElementById('bookingMsg').textContent = '✅ Booking saved! We’ll see you then.';
});
