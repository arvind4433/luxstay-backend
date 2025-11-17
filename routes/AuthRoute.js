const express = require("express");
const UserController = require("../controllers/AuthController");
const { verifyToken } = require("../libs/jwt");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/getUser", verifyToken, UserController.getUser);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", verifyToken, UserController.updatePassword);
router.post("/social/google", UserController.googleLogin);

module.exports = router;
