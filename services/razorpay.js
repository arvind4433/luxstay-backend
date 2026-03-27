
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })



const createOrder = async (amount, receipt) => {

  var options = {
    amount: amount * 100,  // Amount is in currency subunits. 
    currency: "INR",
    receipt: "order_rc" + receipt
  };
  const order = await instance.orders.create(options);

  return order;

}

const verifySignature = (orderId, paymentId, signature) => {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", process.env.RAZOR_KEY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  const generated_signature = hmac.digest("hex");
  return generated_signature === signature;
}

module.exports = {
  createOrder,
  verifySignature
}
