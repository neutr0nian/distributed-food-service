const mongoose = require("mongoose");
const { orderSchema } = require("../models/orderModel");
const { ITEM_PRICE } = require("../resources/constants");

const Order = mongoose.model("Order", orderSchema);

/**
 * Place a new order
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */

const placeOrder = (req, res, next) => {
  let orderDetails = req.body;

  orderDetails.total = orderDetails.items.reduce((currentTotal, item) => {
    return currentTotal + ITEM_PRICE[item.name] * item.quantity;
  }, 0);

  let newOrder = new Order(orderDetails);
  newOrder.save((err, order) => {
    if (err) {
      return next(err);
    }

    req.exchangeServices.publishOrderToExchange(order);

    res.status(201).json(order);
  });
};

/**
 * Fetch order details based on order ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getOrderById = (req, res, next) => {
  Order.findById(req.params.orderId)
    .select("-__v -items._id")
    .exec((err, order) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(order);
    });
};

module.exports = {
  placeOrder: placeOrder,
  getOrderById: getOrderById,
};
