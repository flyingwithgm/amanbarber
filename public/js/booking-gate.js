try {
  console.log("Setting up Paystack payment...");

  const handler = PaystackPop.setup({
    key: paystackPublicKey,
    email: `${phone}@Amanfourbarber72@gmail.com`,
    amount: amountPES,
    currency: 'GHS',
    callback: async function(response) {
      console.log("Payment successful:", response);
      try {
        await addDoc(collection(db, 'bookings'), {
          name,
          phone,
          service,
          date,
          time,
          created: serverTimestamp(),
          payRef: response.reference
        });
        bookingMsg.textContent = '✅ Booking confirmed and payment successful!';
        bookingForm.reset();
      } catch (err) {
        bookingMsg.textContent = '❌ Booking save failed: ' + err.message;
      }
    },
    onClose: function() {
      bookingMsg.textContent = '❌ Payment was cancelled.';
      console.log("Payment popup closed.");
    }
  });

  console.log("Opening Paystack popup...");
  handler.openIframe();

} catch (err) {
  console.error("Error setting up Paystack:", err);
  bookingMsg.textContent = '❌ Could not start payment.';
}
