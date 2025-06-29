const { OrderModel } = require("../../Models/OrderModel");

const getAllOrders = async (req, res) => {
    const query = { ...req.body };
    const filter = {};

    // Time-based filtering
    if (query.day && !isNaN(query.day)) {
        filter.orderDate = {
            $gte: new Date(Date.now() - query.day * 24 * 60 * 60 * 1000),
        };
    } else if (query.startDate) {
        filter.orderDate = {
            $gte: new Date(query.startDate),
            $lt: query.endDate ? new Date(query.endDate) : new Date(),
        };
    }

    // Mobile filter
    if (query.mobile) {
        filter.mobile = query.mobile;
    }

    // promoFinder = true means we want promoCode to exist and not be null
    if (query.promoFinder) {
        filter.promoCode = { $ne: null };
    }

    try {
        const order = await OrderModel.find(filter)
            .sort({ orderDate: -1 })
            .populate({ path: "orderList.productId", model: "Product" })
            .populate(["deliveryMethod", "promoCode"])
            .populate({
                path: "promoCode",
                populate: {
                    path: "owner",
                    model: "Employee",
                },
            });

        if (order.length !== 0) {
            return res.status(200).send({
                message: "All orders within the specified date range",
                error: false,
                data: order,
            });
        } else {
            return res.send({
                message: "No orders found within the specified date range",
                error: true,
            });
        }
    } catch (err) {
        console.error("Order fetch error:", err);
        return res.status(500).send({
            message: "Internal server error",
            error: true,
        });
    }
};

module.exports.getAllOrders = getAllOrders;
