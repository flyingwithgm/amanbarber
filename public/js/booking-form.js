// js/booking-form.js
import { auth, db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const bookingForm = document.getElementById('bookingForm');
const serviceSelect = document.getElementById('service');
const bookingMsg = document.getElementById('bookingMsg');

// Get service from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const selectedService = urlParams.get('service');

// Populate services (you can expand this list)
const services = [
  "Regular Haircut – GHS 100",
  "Beard Trim – GHS 80", 
  "Cut + Enhancement – GHS 120",
  "Haircut with Texturizer – GHS 180",
  "Pixie Cut – GHS 250",
  "Extensions – GHS 500",
  "Complete Colored Hair – GHS 220",
  "Part-Colored Haircut – GHS 180"
];

// Populate service dropdown
services.forEach(service => {
  const option = document.createElement('option');
  option.value = service;
  option.textContent = service;
  if (selectedService && service === selectedService) {
    option.selected = true;
  }
  serviceSelect.appendChild(option);
});

// Handle form submission
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!auth.currentUser) {
    bookingMsg.textContent = "Please login first";
    bookingMsg.style.color = "red";
    return;
  }

  const bookingData = {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    service: serviceSelect.value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    phone: document.getElementById('phone').value,
    timestamp: new Date()
  };

  try {
    await addDoc(collection(db, "bookings"), bookingData);
    bookingMsg.textContent = "Booking successful! We'll contact you soon.";
    bookingMsg.style.color = "green";
    bookingForm.reset();
  } catch (error) {
    bookingMsg.textContent = "Error booking: " + error.message;
    bookingMsg.style.color = "red";
  }
});
