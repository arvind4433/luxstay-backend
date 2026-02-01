const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
});


const createOrder = async (amount, receipt, currency = "INR") => {
  try {
    const order = await razorpay.orders.create({
      amount: amount*100, // already in paise
      currency,
      receipt:`receipt_${Date.now()}`,
      partial_payment: false,
      notes: {
        source: "hotel-booking",
      },
    });

    return order;
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw error; // ✅ VERY IMPORTANT
  }
};

module.exports = {
  createOrder,
};
