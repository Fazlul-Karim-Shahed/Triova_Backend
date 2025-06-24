const fs = require("fs");
const path = require("path");
const { OrderModel } = require("../../Models/OrderModel");
const { ProductModel } = require("../../Models/ProductModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const { sendEmail } = require("../../Functions/sendEmail");

const deleteOrder = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.orderId);
        if (!order) {
            return res.status(400).json({ message: "Order not found", error: true });
        }

        const products = await ProductModel.find({
            _id: { $in: order.orderList.map((item) => item.productId) },
        });

        for (const product of products) {
            const orderItem = order.orderList.find((item) => item.productId.toString() === product._id.toString());

            if (!orderItem) continue;

            const quantity = Number(orderItem.quantity);
            product.stock += quantity;

            // Update color-wise stock
            let colorModified = false;
            if (Array.isArray(product.colors)) {
                product.colors = product.colors.map((c) => {
                    if (c.color === orderItem.color) {
                        c.stock = (c.stock || 0) + quantity;
                        colorModified = true;
                    }
                    return c;
                });
                if (colorModified) product.markModified("colors");
            }

            // Update size-wise stock
            let sizeModified = false;
            if (Array.isArray(product.sizes)) {
                product.sizes = product.sizes.map((s) => {
                    const matchColor = !s.referenceColor || s.referenceColor === "" || s.referenceColor === "0" || s.referenceColor === orderItem.color;
                    if (s.size === orderItem.size && matchColor) {
                        s.stock = (s.stock || 0) + quantity;
                        sizeModified = true;
                    }
                    return s;
                });
                if (sizeModified) product.markModified("sizes");
            }

            await product.save();
        }

        await OrderModel.findByIdAndDelete(req.params.orderId);

        const customerEmailTemplate = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 5px;">
        <div style=margin: auto; background-color: #ffffff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <h2 style="color: #222;">🛍️ Order Cancellation</h2>
            
            <p>Dear <strong>${order.name}</strong>,</p>
            <p>We regret to inform you that your order has been cancelled  </p>

            <h3 style="margin-top: 30px;">📦 Order Details</h3>
            <p><strong>Order No:</strong> #${order.orderNo}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background-color: #f0f0f0; text-align: left;">
                <th style="padding: 8px; border: 1px solid #ddd;">#</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Color</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Size</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderList
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



            <p style="margin-top: 40px;">
            If you have any questions or need further assistance, please feel free to contact us at <a href='mailto:triovabd@gmail.com'>triovabd@gmail.com</a> or call us at <a href='tel:+8801312379588'>+8801312379588</a>.
            </p>
            <p>Best regards,<br><strong>Triova Limited Team</strong></p>
        </div>
        </div>
    `;

        await sendEmail(order.email, `Your Order #${order.orderNo} has been cancelled`, customerEmailTemplate); // For customer

        return res.status(200).json({
            message: "Order deleted and stock restored successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "An error occurred while deleting order",
            error: err,
        });
    }
};

module.exports.deleteOrder = deleteOrder;
