const { OrderModel } = require("../../Models/OrderModel");
const { ProductModel } = require("../../Models/ProductModel");
const { EmployeeModel } = require("../../Models/EmployeeModel");

const updateOrderStatus = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.orderId).populate("reffer");

        if (!order) {
            return res.status(400).json({ message: "Order not found", error: true });
        }

        const products = await ProductModel.find({
            _id: { $in: order.orderList.map((item) => item.productId) },
        });

        order.orderStatus = req.body.orderStatus;
        order.deliveryMethod = req.body.deliveryMethod;

        await order.save();

        // ✅ If order is Returned → restore stock
        if (order.orderStatus === "Returned") {
            for (let product of products) {
                const orderItem = order.orderList.find((item) => item.productId.toString() === product._id.toString());

                product.stock += Number(orderItem.quantity);

                // Update color stock
                if (product.colors.length > 0) {
                    product.colors = product.colors.map((c) => {
                        if (c.color === orderItem.color) {
                            c.stock += Number(orderItem.quantity);
                        }
                        return c;
                    });
                }

                // Update size stock
                if (product.sizes.length > 0) {
                    product.sizes = product.sizes.map((s) => {
                        const matchColor = !s.referenceColor || s.referenceColor === "" || s.referenceColor === 0 || s.referenceColor === orderItem.color;
                        if (s.size === orderItem.size && matchColor) {
                            s.stock += Number(orderItem.quantity);
                        }
                        return s;
                    });
                }

                await ProductModel.findByIdAndUpdate(product._id, product);
            }
        }

        // ✅ Recalculate employee commission if order has a refferer
        if (order.reffer && order.reffer._id) {
            const employeeId = order.reffer._id;

            const allDeliveredOrders = await OrderModel.find({
                reffer: employeeId,
                orderStatus: "Delivered",
            });

            let totalCommission = 0;

            for (let o of allDeliveredOrders) {
                const rate = o.commission || 0;
                totalCommission += o.totalPrice * (rate / 100);
            }

            // 🔁 Update employee's totalCommission
            await EmployeeModel.findByIdAndUpdate(employeeId, {
                totalCommission: totalCommission,
            });
        }

        res.status(200).json({
            message: `Order ${order.orderStatus} successfully`,
            order,
        });
    } catch (err) {
        console.error("Order status update error:", err);
        res.status(500).json({
            message: `Failed to update order`,
            error: err,
        });
    }
};

module.exports.updateOrderStatus = updateOrderStatus;
