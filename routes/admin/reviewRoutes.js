const express = require("express");
const reviewController = require("../../controllers/admin/reviewController");

const router = express.Router();

router.post("/addReview", reviewController.addReview);
router.get("/getAll", reviewController.getAll);
router.get("/get/:id", reviewController.get);
router.put("/update/:id", reviewController.update);
router.delete("/delete/:id", reviewController.remove);

module.exports = router;
