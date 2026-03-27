const Order = require('../../models/Order');
const User = require('../../models/User');
const mailService = require('../../services/mailer');

/**
 * Create a new order
 * POST /api/user/orders
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      planId,
      planName,
      projectName,
      websiteType,
      numberOfPages,
      businessCategory,
      requiredFeatures,
      designStyle,
      referenceWebsites,
      projectDescription,
      preferredDeadline,
      contactEmail,
      phoneNumber,
      estimatedPrice
    } = req.body;

    // Validation
    if (!projectName || !businessCategory || !projectDescription) {
      return res.status(400).json({ 
        message: 'Missing required fields: projectName, businessCategory, projectDescription' 
      });
    }

    if (!contactEmail || !contactEmail.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Create order
    const order = new Order({
      userId,
      planId,
      planName,
      projectName,
      websiteType,
      numberOfPages: parseInt(numberOfPages) || 5,
      businessCategory,
      requiredFeatures: requiredFeatures || [],
      designStyle,
      referenceWebsites: referenceWebsites ? referenceWebsites.split(',').map(url => url.trim()) : [],
      projectDescription,
      preferredDeadline: preferredDeadline ? new Date(preferredDeadline) : null,
      contactEmail: contactEmail.toLowerCase(),
      phoneNumber,
      estimatedPrice: estimatedPrice || 0,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    await order.save();

    // Get user for email
    const user = await User.findById(userId);

    // Send confirmation email
    if (user?.email) {
      const emailMessage = `
        <h2 style="color: #3b82f6;">Project Order Received</h2>
        <p>Thank you for placing an order with BookMyHotelRoom!</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Details:</strong></p>
          <p>Project Name: ${projectName}</p>
          <p>Plan: ${planName}</p>
          <p>Website Type: ${websiteType}</p>
          <p>Number of Pages: ${numberOfPages}</p>
          <p>Business Category: ${businessCategory}</p>
          <p>Status: <span style="color: #f59e0b; font-weight: bold;">Pending</span></p>
        </div>
        <p>Your project order has been created and is pending acceptance from our development team. You can view your order details in your dashboard.</p>
        <p>Estimated Price: <strong>${estimatedPrice ? '₹' + (estimatedPrice / 100).toLocaleString() : 'Custom Quote'}</strong></p>
        <p style="margin-top: 20px; color: #6b7280;">
          <strong>Next Steps:</strong><br>
          1. Review your order details<br>
          2. Make payment to confirm<br>
          3. Our team will start working on your project<br>
          4. You can message your developer anytime
        </p>
      `;
      
      await mailService.SendMail(
        user.email,
        `Order ${order._id} - Project Order Received`,
        emailMessage
      );
    }

    // Send notification email to admin (optional)
    // This could be sent to an admin email or a developers pool

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Proceed to payment.',
      data: {
        orderId: order._id,
        ...order.getSummary()
      }
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create order' 
    });
  }
};

/**
 * Get user's orders
 * GET /api/user/orders
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const { status, sortBy = '-createdAt', limit = 10, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('assignedDeveloper', 'name avatar')
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          ...order,
          formattedPrice: order.estimatedPrice ? `₹${(order.estimatedPrice / 100).toLocaleString()}` : 'Custom Quote'
        })),
        total,
        remaining: Math.max(0, total - (parseInt(skip) + parseInt(limit)))
      }
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch orders' 
    });
  }
};

/**
 * Get single order details
 * GET /api/user/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await Order.findOne({
      _id: id,
      userId
    }).populate('assignedDeveloper', 'name avatar email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: {
        ...order._doc,
        formattedPrice: order.estimatedPrice ? `₹${(order.estimatedPrice / 100).toLocaleString()}` : 'Custom Quote'
      }
    });

  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch order' 
    });
  }
};

/**
 * Update order
 * PUT /api/user/orders/:id
 */
const updateOrder = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await Order.findOne({
      _id: id,
      userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow updating certain fields
    const allowedFields = [
      'projectDescription',
      'requiredFeatures',
      'referenceWebsites',
      'clientNotes',
      'preferredDeadline'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(order, updates);
    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update order' 
    });
  }
};

/**
 * Cancel order
 * DELETE /api/user/orders/:id
 */
const deleteOrder = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await Order.findOne({
      _id: id,
      userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Can only delete pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot delete order with status '${order.status}'. Only pending orders can be deleted.` 
      });
    }

    // Can only delete unpaid orders
    if (order.paymentStatus !== 'unpaid') {
      return res.status(400).json({ 
        message: 'Cannot delete orders with payment. Please contact support for refunds.' 
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to delete order' 
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
