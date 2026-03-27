const express = require('express');
const UserController = require('../../controllers/admin/userController');
const { verifyToken } = require('../../services/jwt');
const upload = require('../../utils/uploadFile');
const router = express.Router();

router.get('/get', verifyToken, UserController.getUser);
router.post('/logout', verifyToken, UserController.logout);

router.post('/update', verifyToken, upload.single("avatar"), UserController.update);


module.exports = router;