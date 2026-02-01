const express = require('express');
const UserController = require('../../controllers/user/userController');
const { verifyToken } = require('../../services/jwt');
const router = express.Router();

router.get('/get', verifyToken, UserController.getUser);
router.post('/logout', verifyToken, UserController.logout);


module.exports = router;