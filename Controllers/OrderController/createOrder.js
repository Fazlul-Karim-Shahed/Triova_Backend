const { OrderModel } = require("../../Models/OrderModel");
const { ProductModel } = require("../../Models/ProductModel");
const { cleanObject } = require("../../Functions/cleanObject");
const { sendEmail } = require("../../Functions/sendEmail");

const createOrder = async (req, res) => {
    try {
        let products = await ProductModel.find({
            _id: { $in: req.body.orderList.map((item) => item.productId) },
        });

        // Stock validation
        for (let product of products) {
            const orderItem = req.body.orderList.find((item) => item.productId == product._id);

            if (product.stock < Number(orderItem.quantity)) {
                return res.status(400).json({
                    message: `Stock is not available for ${product.name}. Available only ${product.stock}`,
                    error: true,
                });
            }

            if (product.colors.length > 0 && orderItem.color != "") {
                const colorObj = product.colors.find((c) => c.color == orderItem.color);
                if (!colorObj || colorObj.stock < Number(orderItem.quantity)) {
                    return res.status(400).json({
                        message: `Stock is not available for Color: ${orderItem.color} Product: ${product.name}. Available only ${colorObj?.stock || 0}`,
                        error: true,
                    });
                }
            }

            if (product.sizes.length > 0 && orderItem.size != "") {
                const sizeMatch = product.sizes.filter((s) => {
                    return s.size == orderItem.size && (!s.referenceColor || s.referenceColor === orderItem.color);
                });

                if (!sizeMatch.length) {
                    return res.status(400).json({
                        message: `Size ${orderItem.size} is not available for ${product.name}`,
                        error: true,
                    });
                }

                if (sizeMatch[0].stock < Number(orderItem.quantity)) {
                    return res.status(400).json({
                        message: `Stock is not available for Size: ${orderItem.size} Product: ${product.name}. Available only ${sizeMatch[0].stock}`,
                        error: true,
                    });
                }
            }
        }

        // Create Order
        const order = new OrderModel(cleanObject(req.body));
        order.orderNo = new Date().getUTCDate() + "" + (new Date().getUTCMonth() + 1) + "" + ((await OrderModel.countDocuments()) + 1);
        const savedOrder = await order.save();

        // Update product stocks
        for (let product of products) {
            const orderItem = req.body.orderList.find((item) => item.productId == product._id);

            product.stock -= Number(orderItem.quantity);

            if (product.colors.length > 0) {
                product.colors = product.colors.map((c) => {
                    if (c.color == orderItem.color) {
                        c.stock -= Number(orderItem.quantity);
                    }
                    return c;
                });
            }

            if (product.sizes.length > 0) {
                product.sizes = product.sizes.map((s) => {
                    if (s.size == orderItem.size && (!s.referenceColor || s.referenceColor === orderItem.color)) {
                        s.stock -= Number(orderItem.quantity);
                    }
                    return s;
                });
            }

            await ProductModel.findByIdAndUpdate(product._id, product);
        }

        // Email content

        const customerEmail = savedOrder.email;
        const orderSummary = savedOrder.orderList
            .map(
                (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${products.find((p) => p._id.toString() === item.productId.toString())?.name || "-"}</td>
                <td>${item.color || "-"}</td>
                <td>${item.size || "-"}</td>
                <td>${item.quantity}</td>
                <td>${item.total}</td>
            </tr>
        `
            )
            .join("");

        const customerEmailTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; padding: 0px;">
            <div style="margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
                <!-- Header -->
                <div style="background: linear-gradient(to right, #667eea, #764ba2); color: white; padding: 20px 30px;">
                <h2 style="margin: 0; font-size: 24px;">🛍️ Order Confirmation - Triova Limited</h2>
                </div>
        
                <!-- Body -->
                <div style="padding: 20px;">
                <p style="font-size: 16px;">Dear <strong>${savedOrder.name}</strong>,</p>
                <p style="font-size: 15px; color: #444;">Thank you for shopping with us! Here are the details of your order.</p>
        
                <h3 style="margin-top: 30px; font-size: 18px; color: #333;">📦 Order Details</h3>
                <p><strong>Order No:</strong> #${savedOrder.orderNo}</p>
                <p><strong>Date:</strong> ${new Date(savedOrder.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>
        
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead style="background-color: #f0f0f0;">
                    <tr>
                        <th style="padding: 10px; border: 1px solid #ddd;">#</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Product</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Color</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Size</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${savedOrder.orderList
                        .map(
                            (item, index) => `
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${products.find((p) => p._id.toString() === item.productId.toString())?.name || "-"}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.color || "-"}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.size || "-"}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.total}</td>
                        </tr>
                    `
                        )
                        .join("")}
                    </tbody>
                </table>
        
                <h3 style="margin-top: 30px; font-size: 18px; color: #333;">🧾 Payment Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Main Price:</td>
                        <td style="padding: 8px;">${savedOrder.mainPrice} BDT</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Discount:</td>
                        <td style="padding: 8px;">${savedOrder.discountedAmount} BDT</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Delivery Charge:</td>
                        <td style="padding: 8px;">${savedOrder.deliveryCharge || 0} BDT</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; font-weight: bold;">Subtotal:</td>
                        <td style="padding: 8px; font-weight: bold;">${savedOrder.totalPrice + (savedOrder.deliveryCharge || 0)} BDT</td>
                    </tr>
                    </tbody>
                </table>
        
                <h3 style="margin-top: 30px; font-size: 18px; color: #333;">🚚 Delivery Info</h3>
                <p><strong>Shipping Address:</strong> ${savedOrder.shippingAddress}</p>
        
                <p style="margin-top: 20px;">🧾 Payment Method: ${savedOrder.paymentMethod}</p>
                <p>Status: <strong>${savedOrder.paymentStatus}</strong></p>
        
                <p style="margin-top: 40px; font-size: 14px; color: #666;">
                    We will process your order shortly. Thank you for choosing <strong>Triova Limited</strong>!
                </p>
        
                <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>Triova Team</strong></p>
                </div>
            </div>
            </div>
            `;

        const adminEmailTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; padding: 0px;">
              <div style="margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
                <!-- Header -->
                <div style="background: linear-gradient(to right, #667eea, #764ba2); color: white; padding: 20px 30px;">
                  <h2 style="margin: 0; font-size: 24px;">🛒 New Order Received - #${savedOrder.orderNo}</h2>
                </div>
          
                <!-- Body -->
                <div style="padding: 20px;">
                  <h3 style="font-size: 18px; color: #333;">👤 Customer Info</h3>
                  <p><strong>Name:</strong> ${savedOrder.name}</p>
                  <p><strong>Email:</strong> ${savedOrder.email || "-"}</p>
                  <p><strong>Mobile:</strong> ${savedOrder.mobile}</p>
          
                  <h3 style="font-size: 18px; color: #333;">📍 Address Info</h3>
                  <p><strong>Billing Address:</strong> ${savedOrder.billingAddress || "-"}</p>
                  <p><strong>Shipping Address:</strong> ${savedOrder.shippingAddress}</p>
          
                  <h3 style="font-size: 18px; color: #333;">📦 Order Items</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead style="background-color: #f0f0f0;">
                      <tr>
                        <th style="padding: 10px; border: 1px solid #ddd;">#</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Product</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Color</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Size</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${savedOrder.orderList
                          .map(
                              (item, index) => `
                        <tr>
                          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${products.find((p) => p._id.toString() === item.productId.toString())?.name || "-"}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.color || "-"}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.size || "-"}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                          <td style="padding: 8px; border: 1px solid #ddd;">${item.total} Tk</td>
                        </tr>
                      `
                          )
                          .join("")}
                    </tbody>
                  </table>
          
                  <h3 style="font-size: 18px; color: #333;">💳 Payment & Delivery Info</h3>
                  <p><strong>Payment Method:</strong> ${savedOrder.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> ${savedOrder.paymentStatus}</p>
                  <p><strong>Delivery Method:</strong> ${savedOrder.deliveryMethod?.name || "-"}</p>
                  <p><strong>Order Status:</strong> ${savedOrder.orderStatus}</p>
          
                  <h3 style="font-size: 18px; color: #333;">🧾 Payment Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tbody>
                      <tr>
                        <td style="padding: 8px; font-weight: bold;">Main Price:</td>
                        <td style="padding: 8px;">${savedOrder.mainPrice} Tk</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-weight: bold;">Discount:</td>
                        <td style="padding: 8px;">${savedOrder.discountedAmount} Tk</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-weight: bold;">Delivery Charge:</td>
                        <td style="padding: 8px;">${savedOrder.deliveryCharge || 0} Tk</td>
                      </tr>
                      <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; font-weight: bold;">Subtotal:</td>
                        <td style="padding: 8px; font-weight: bold;">${savedOrder.totalPrice + (savedOrder.deliveryCharge || 0)} Tk</td>
                      </tr>
                    </tbody>
                  </table>
          
                  <p style="margin-top: 20px;">📅 Order Date: ${new Date(savedOrder.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>
                  <p>📌 Notes: ${savedOrder.orderNotes || "None"}</p>
          
                  <p style="margin-top: 40px; font-size: 14px; color: #666;">🛎️ Please process this order promptly.</p>
                  <p style="font-size: 14px; color: #666;">— <strong>Triova Limited System</strong></p>
                </div>
              </div>
            </div>
          `;

        // Send emails
        await sendEmail(customerEmail, `Your Order #${savedOrder.orderNo} Confirmation`, customerEmailTemplate); // For customer
        await sendEmail(process.env.EMAIL_USER, `New Order Received - #${savedOrder.orderNo}`, adminEmailTemplate); // For admin

        return res.status(200).json({
            message: "Order placed successfully",
            data: savedOrder,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            message: "Failed to create order",
            error: err,
        });
    }
};

module.exports.createOrder = createOrder;
