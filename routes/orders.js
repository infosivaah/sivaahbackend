const express = require("express");
const axios = require("axios");

const router = express.Router();

const Order = require("../models/Order");
const nodemailer =
    require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
/* =====================================
   SHIPROCKET LOGIN
===================================== */

const getShiprocketToken =
  async () => {

    try {

      const response =
        await axios.post(
          "https://apiv2.shiprocket.in/v1/external/auth/login",
          {
            email:
              process.env
                .SHIPROCKET_EMAIL,

            password:
              process.env
                .SHIPROCKET_PASSWORD
          }
        );

      console.log(
        "SHIPROCKET LOGIN RESPONSE:"
      );

      console.log(
        response.data
      );

      return response.data.token;

    } catch (err) {

      console.log(
        "SHIPROCKET LOGIN ERROR:"
      );

      console.log(
        err.response?.data ||
        err.message
      );

      return null;
    }
  };

/* =====================================
   CREATE ORDER
===================================== */

router.post("/", async (req, res) => {

    try {

        const {
            customer,
            products,
            totalAmount,
            paymentMethod,
            paymentStatus,
            razorpay_order_id,
            razorpay_payment_id
        } = req.body;

        /* ORDER ID */

        const orderId =
            "SIV" +
            Date.now();

        /* SAVE MONGODB */

        const newOrder =
            await Order.create({
                orderId,

                customer,

                products,

                totalAmount,

                paymentMethod,

                paymentStatus,

                razorpay_order_id,

                razorpay_payment_id
            });

        /* =====================================
           SHIPROCKET
        ===================================== */

        try {

            const token =
                await getShiprocketToken();
console.log(
  "TOKEN:",
  token
);
            const orderItems =
                products.map((p) => ({
                    name: p.name,
                    sku:
                        p.slug ||
                        p.name,

                    units: p.qty,

                    selling_price:
                        p.price
                }));

            const shiprocketRes =
                await axios.post(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    {
                        order_id: orderId,
                        order_date:
                            new Date()
                                .toISOString()
                                .slice(0, 19)
                                .replace("T", " "),


                        pickup_location:
                            "home",

                        billing_customer_name:
                            customer.name,

                        billing_last_name:
                            "",

                        billing_address:
                            customer.address,

                        billing_city:
                            customer.city,

                        billing_pincode:
                            customer.pincode,

                        billing_state:
                            "Uttar Pradesh",

                        billing_country:
                            "India",

                        billing_email:
                            customer.email ||
                            "infosivaah@gmail.com",

                        billing_phone:
                            customer.phone,

                        shipping_is_billing:
                            true,

                        order_items:
                            orderItems,

                        payment_method:
                            paymentMethod ===
                                "COD"
                                ? "COD"
                                : "Prepaid",

                        sub_total:
                            totalAmount,

                        length: 10,
                        breadth: 10,
                        height: 4,
                        weight: 0.5
                    },

                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            /* SAVE SHIPROCKET DATA */

            newOrder.shiprocketOrderId =
                shiprocketRes.data.order_id;

            newOrder.shippingStatus =
                "CONFIRMED";

            await newOrder.save();

        } catch (shipErr) {

            console.log(
                "Shiprocket Error:",
                shipErr.response?.data ||
                shipErr.message
            );
        }
        /* =====================================
           EMAILS
        ===================================== */

        try {

            /* CUSTOMER EMAIL */
            const productsHtml =
                products.map(
                    (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>₹${p.price}</td>
      </tr>
    `
                ).join("");
            if (customer.email) {

                await transporter.sendMail({

                    from:
                        process.env.EMAIL_USER,

                    to:
                        customer.email,

                    subject:
                        `Order Confirmed - ${orderId}`,

                    html: `

        <div style="font-family:sans-serif">

          <h2>
            Thank you for shopping with SIVAAH ✨
          </h2>

          <p>
            Your order has been placed successfully.
          </p>

          <p>
            <b>Order ID:</b>
            ${orderId}
          </p>

          <p>
            <b>Payment:</b>
            ${paymentMethod}
          </p>

          <p>
            <b>Total:</b>
            ₹${totalAmount}
          </p>
          <h3>
  Ordered Products
</h3>

<table
  border="1"
  cellpadding="8"
  cellspacing="0"
  style="border-collapse:collapse"
>

<tr>
  <th>Product</th>
  <th>Qty</th>
  <th>Price</th>
</tr>

${productsHtml}

</table>

          <p>
            We’ll notify you once your order is shipped.
          </p>

          <br/>

          <p>
            Team SIVAAH
          </p>

        </div>
      `
                });
            }

            /* ADMIN EMAIL */

            await transporter.sendMail({

                from:
                    process.env.EMAIL_USER,

                to:
                    "infosivaah@gmail.com",

                subject:
                    `New Order Received - ${orderId}`,


                html: `

      <div style="font-family:sans-serif">

        <h2>
          New Order Received 🚀
        </h2>

        <p>
          <b>Order ID:</b>
          ${orderId}
        </p>

        <p>
          <b>Name:</b>
          ${customer.name}
        </p>

        <p>
          <b>Phone:</b>
          ${customer.phone}
        </p>
 <p>
          <b>City:</b>
          ${customer.address}
        </p>
        <p>
          <b>City:</b>
          ${customer.city}
        </p>

        <p>
          <b>Total:</b>
          ₹${totalAmount}
        </p>

        <p>
          <b>Payment:</b>
          ${paymentMethod}
        </p>
        <h3>
  Ordered Products
</h3>

<table
  border="1"
  cellpadding="8"
  cellspacing="0"
  style="border-collapse:collapse"
>

<tr>
  <th>Product</th>
  <th>Qty</th>
  <th>Price</th>
</tr>

${productsHtml}

</table>

      </div>
    `
            });

        } catch (mailErr) {

            console.log(
                "MAIL ERROR:",
                mailErr.message
            );
        }
        /* SUCCESS */

        res.json({
            success: true,

            orderId:
                newOrder.orderId,

            order:
                newOrder
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });
    }
});

module.exports = router;