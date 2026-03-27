const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderController');
const { verifyToken } = require('../../services/jwt');

/**
 * Order Management Routes
 * Base: /api/user/orders
 */

// Create new order
// POST /api/user/orders
router.post('/', verifyToken, orderController.createOrder);

// Get user's orders
// GET /api/user/orders?status=pending&sortBy=-createdAt&limit=10&skip=0
router.get('/', verifyToken, orderController.getOrders);

// Get order by ID
// GET /api/user/orders/:id
router.get('/:id', verifyToken, orderController.getOrderById);

// Update order
// PUT /api/user/orders/:id
router.put('/:id', verifyToken, orderController.updateOrder);

// Delete/Cancel order
// DELETE /api/user/orders/:id
router.delete('/:id', verifyToken, orderController.deleteOrder);

module.exports = router;
