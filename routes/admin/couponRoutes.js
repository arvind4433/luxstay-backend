const express = require("express");
const couponController = require("../../controllers/admin/couponController");

const router = express.Router();

router.post("/addCoupon", couponController.addCoupon);
router.get("/getAll", couponController.getAll);
router.get("/get/:id", couponController.get);
router.put("/update/:id", couponController.update);
router.delete("/delete/:id", couponController.remove);

module.exports = router;
