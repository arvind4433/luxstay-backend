const express = require('express');
const AuthController = require('../../controllers/admin/adminController');
const {validateRegister, validateLogin} = require('../../utils/validate');
const router = express.Router();

// Admin authentication routes would go here (e.g., login, logout, password reset)


router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);


module.exports = router;