import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const serviceSelect = document.getElementById('service');
serviceSelect.innerHTML = `
  <option value="" disabled selected>-- Pick a Service --</option>
  <option>Regular Haircut – GHS 100</option>
  <option>Beard Trim – GHS 80</option>
  <option>Cut + Enhancement – GHS 120</option>
  <option>Haircut with Texturizer – GHS 180</option>
  <option>Pixie Cut – GHS 250</option>
  <option>Extensions – GHS 500</option>
  <option>Complete Colored Hair – GHS 220</option>
  <option>Part-Colored Haircut – GHS 180</option>
`;

const urlParams = new URLSearchParams(location.search);
const wanted = decodeURIComponent(urlParams.get('service') || '');
[...serviceSelect.options].forEach(opt=>{
  if (opt.text === wanted) opt.selected = true;
});

document.getElementById('bookingForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const data = {
    uid:     auth.currentUser.uid,
    email:   auth.currentUser.email,
    service: serviceSelect.value,
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    phone:   document.getElementById('phone').value,
    created: serverTimestamp()
  };
  await addDoc(collection(db, 'bookings'), data);
  document.getElementById('bookingMsg').textContent = '✅ Booking saved!';
});
