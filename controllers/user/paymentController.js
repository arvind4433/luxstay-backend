const Payment = require("../../models/Payment");
const { createOrder } = require("../../services/razorpay");

const createPaymentOrder = async (req, res) => {
    try {

      const {amount} = req.body; 
      
       

const razorpayOrder = await createOrder(
      50 * 100,
      "INR"
    );
        return res.status(201).json({
            status: true,
            message: "payment created successfully",
            data: razorpayOrder
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


module.exports = {
     createPaymentOrder
};
