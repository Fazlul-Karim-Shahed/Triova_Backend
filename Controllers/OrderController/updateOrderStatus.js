


const fs = require('fs');
const path = require('path');
const { OrderModel } = require("../../Models/OrderModel");
const { ProductModel } = require("../../Models/ProductModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateOrderStatus = async (req, res) => {

    let order = await OrderModel.findById(req.params.orderId)
    let products = await ProductModel.find({ _id: { $in: order.orderList.map(item => item.productId) } })

    if (!order) {
        res.status(400).json({ message: "Order not found", error: true })
    }

    order.orderStatus = req.body.orderStatus;
    order.deliveryMethod = req.body.deliveryMethod;


    if (order.orderStatus == 'Returned') {
        order.save().then(order => {
            for (let product in products) {
                product = products[product]
                let orderItem = order.orderList.find(item => item.productId == product._id)

                product.stock = product.stock + Number(orderItem.quantity)
                if (product.colors.length > 0) {
                    product.colors = product.colors.map(c => {
                        if (c.color == orderItem.color) {
                            c.stock = c.stock + Number(orderItem.quantity)
                        }
                        return c
                    })
                }
                if (product.sizes.length > 0) {
                    product.sizes = product.sizes.map(s => {
                        if ((s.size == orderItem.size) && (s.referenceColor == '' || s.referenceColor == 0 || s.referenceColor == null) ? true : (s.referenceColor === orderItem.color)) {
                            s.stock = s.stock + Number(orderItem.quantity)
                        }
                        return s
                    })
                }

                ProductModel.findByIdAndUpdate(product._id, product).then(product => { }).catch(err => { res.status(400).json({ message: `Failed to update product ${product.name}`, error: err }) })
            }
            res.status(200).json({ message: `Order ${order.orderStatus} successfully`, order })
        }).catch(err => {
            res.status(400).json({ message: `Failed to ${order.orderStatus} order`, error: err })
        })
    }

    else {
        order.save().then(order => {
            res.status(200).json({ message: `Order ${order.orderStatus} successfully`, order })
        }).catch(err => {
            res.status(400).json({ message: `Failed to ${order.orderStatus} order`, error: err })
        })
    }




}

module.exports.updateOrderStatus = updateOrderStatus
