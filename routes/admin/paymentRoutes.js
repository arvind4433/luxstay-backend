const express = require("express");
const paymentController = require("../../controllers/admin/paymentController");

const router = express.Router();

router.post("/addPayment", paymentController.addPayment);
router.get("/getAll", paymentController.getAll);
router.get("/get/:id", paymentController.get);
router.put("/update/:id", paymentController.update);
router.delete("/delete/:id", paymentController.remove);

module.exports = router;
