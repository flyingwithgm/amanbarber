import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Pre-select service
const urlParams = new URLSearchParams(location.search);
const wanted = decodeURIComponent(urlParams.get('service') || '');
[...document.getElementById('service').options].forEach(opt=>{
  if (opt.text === wanted) opt.selected = true;
});

// Manual login gate
document.getElementById('loginForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass);
  }
  document.getElementById('loginCard').hidden = true;
  document.getElementById('bookingForm').hidden = false;
  document.getElementById('bookingForm').scrollIntoView({behavior:'smooth'});
});

// Submit booking
document.getElementById('bookingForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const data = {
    name:    document.getElementById('name').value,
    phone:   document.getElementById('phone').value,
    service: document.getElementById('service').value,
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    created: serverTimestamp()
  };
  await addDoc(collection(db, 'bookings'), data);
  document.getElementById('bookingMsg').textContent = '✅ Booking saved!';
  document.getElementById('btnShare').hidden = false;
});

function shareOnWhatsApp() {
  const text = `Just got a clean cut at Amanfour Barbers Palace in Tarkwa! 🔥 Highly recommend! https://amanfour.vercel.app`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
