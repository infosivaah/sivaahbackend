const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const razorpay = require("../config/razorpay");

/* =================================
   CREATE ORDER
================================= */

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Order creation failed"
    });
  }
});

/* =================================
   VERIFY PAYMENT
================================= */

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    const isAuthentic =
      expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    return res.json({
      success: true
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;