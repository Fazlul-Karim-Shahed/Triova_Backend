const { model, Schema } = require("mongoose");

const OrderModel = model(
    "Order",
    new Schema(
        {
            orderNo: { type: String, required: [true, "Order No is required"] },
            user: { type: Schema.Types.ObjectId, ref: "User" },
            orderTaker: { type: Object },
            name: { type: String, required: [true, "Name is required"] },
            email: { type: String },
            mobile: { type: String, required: [true, "mobile is required"] },
            billingAddress: { type: String },
            shippingAddress: { type: String, required: [true, "Shipping Address is required"] },

            orderList: [
                {
                    type: Object,
                    productId: { type: Schema.Types.ObjectId, ref: "Product" },
                    quantity: { type: Number, required: true },
                    color: { type: String },
                    size: { type: String },
                    price: { type: Number, required: true },
                    total: { type: Number, required: true },
                },
            ],

            mainPrice: { type: Number, required: true },
            discountedAmount: { type: Number, required: true },
            totalPrice: { type: Number, required: true },

            discount: { type: Number },
            paymentMethod: { type: String, required: [true, "Payment Method is required"], default: "Cash on Delivery", enum: ["Cash on Delivery", "Bkash", "Nagad", "Card", "Bank"] },

            paymentStatus: { type: String, required: [true, "Payment Status is required"], default: "Unpaid", enum: ["Unpaid", "Paid"] },

            transactionId: { type: String },

            deliveryMethod: { type: Schema.Types.ObjectId, ref: "Courier" },

            orderStatus: {
                type: String,
                required: [true, "Order Status is required"],
                default: "Pending",
                enum: ["Pending", "Processing", "Shipped", "Delivered", "Pending Return", "Returned", "Cancelled"],
            },

            orderDate: { type: Date, default: Date.now },

            orderNotes: { type: String },

            deliveryCharge: { type: Number },
            orderTaker: { type: String },
            orderTakerRole: { type: String, default: "user" },
        },
        { timestamps: true }
    )
);

module.exports.OrderModel = OrderModel;
