const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },

    customer: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String
    },

    products: [
      {
        name: String,
        price: Number,
        qty: Number,
        image: String,
        slug: String
      }
    ],

    totalAmount: Number,

    paymentMethod: String,

    paymentStatus: {
      type: String,
      default: "PENDING"
    },

    shippingStatus: {
      type: String,
      default: "PROCESSING"
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,

    shiprocketOrderId: String,

    awbCode: String,

    courierName: String,

    trackingUrl: String
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Order",
    OrderSchema
  );