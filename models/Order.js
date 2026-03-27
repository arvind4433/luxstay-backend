const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Plan Information
    planId: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'custom'],
      required: true
    },
    planName: String,
    estimatedPrice: Number, // in paise

    // Project Details
    projectName: {
      type: String,
      required: true,
      trim: true
    },
    websiteType: {
      type: String,
      enum: ['ecommerce', 'blog', 'portfolio', 'business', 'landing', 'other'],
      default: 'business'
    },
    numberOfPages: {
      type: Number,
      required: true,
      min: 1
    },
    businessCategory: {
      type: String,
      required: true
    },

    // Features & Requirements
    requiredFeatures: [String], // e.g., ['Blog', 'Newsletter', 'User Accounts']
    designStyle: {
      type: String,
      enum: ['modern', 'vibrant', 'elegant', 'playful'],
      default: 'modern'
    },
    referenceWebsites: [String],

    // Project Description
    projectDescription: {
      type: String,
      required: true
    },
    preferredDeadline: Date,

    // Contact Information
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phoneNumber: String,

    // File Uploads
    attachedFiles: [{
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Order Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'review', 'completed', 'cancelled'],
      default: 'pending'
    },

    // Assignment
    assignedDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'completed', 'refunded'],
      default: 'unpaid'
    },
    paymentId: String, // Razorpay payment ID
    paymentDate: Date,

    // Notes & Communication
    internalNotes: String,
    clientNotes: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'orders'
  }
);

// Indexes for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ assignedDeveloper: 1 });
OrderSchema.index({ paymentStatus: 1 });

// Pre-save middleware
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted price
OrderSchema.virtual('formattedPrice').get(function () {
  return this.estimatedPrice ? `₹${(this.estimatedPrice / 100).toLocaleString()}` : 'Custom Quote';
});

// Method to get order summary
OrderSchema.methods.getSummary = function () {
  return {
    id: this._id,
    projectName: this.projectName,
    planName: this.planName,
    price: this.formattedPrice,
    status: this.status,
    createdAt: this.createdAt,
    websiteType: this.websiteType,
    numberOfPages: this.numberOfPages
  };
};

// Prevent duplicate order creation (same user, same project within 1 hour)
OrderSchema.index(
  { userId: 1, projectName: 1, createdAt: 1 },
  { 
    unique: false,
    sparse: true
  }
);

module.exports = mongoose.model('Order', OrderSchema);
