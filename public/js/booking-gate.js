import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Login gate
document.getElementById('bookingForm')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = prompt("Enter your email:");
  const pass = prompt("Enter your password:");
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass);
  }

  const data = {
    name:    document.getElementById('name').value,
    phone:   document.getElementById('phone').value,
    service: document.title.split('–')[1].trim(),
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    created: serverTimestamp()
  };
  await addDoc(collection(db, 'bookings'), data);
  document.getElementById('bookingMsg').textContent = '✅ Booking saved!';
});

function shareOnWhatsApp(service){
  const text = `Just got a clean ${service} at Amanfour Barbers Palace! 🔥 Highly recommend! https://amanfour.vercel.app`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
