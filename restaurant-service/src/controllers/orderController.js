const { orderSchema } = require("../models/orderModel");
const mongoose = require("mongoose");
const { changeOrderStatus } = require("../services/mongoService");
const { ORDER_ACCEPTED, ORDER_DELIVERED } = require("../resources/constants");

const OrderModel = mongoose.model("Order", orderSchema);

const ORDER_DELIVERY_TIME = parseInt(process.env.ORDER_DELIVERY_TIME) || 10000;

/**
 * Process the order.
 */
const processOrder = (order, orderChannel) => {
  orderContent = JSON.parse(order.content.toString());
  changeOrderStatus(OrderModel, orderContent._id, ORDER_ACCEPTED);
  setTimeout(() => {
    changeOrderStatus(OrderModel, orderContent._id, ORDER_DELIVERED);
    orderChannel.ack(order);
  }, ORDER_DELIVERY_TIME);
};

module.exports = {
  processOrder: processOrder,
};
