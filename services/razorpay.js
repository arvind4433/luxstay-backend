const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
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
