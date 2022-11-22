const amqp = require("amqplib");
const { logger } = require("./loggerService");
const MQ_HOST = process.env.MQ_HOST || "localhost";
const MQ_URL = `amqp://${MQ_HOST}:5672`;
const EXCHANGE = "orders";
let orderChannel = null;

const amqpConnect = async () => {
  try {
    const mqConnection = await amqp.connect(MQ_URL);
    orderChannel = await mqConnection.createChannel();

    await orderChannel.assertExchange(EXCHANGE, "fanout", {
      durable: false,
    });

    logger.info(`AMQP - connection established at ${MQ_URL}`);
  } catch (ex) {
    logger.log("fatal", `AMQP - ${ex}`);
    process.exit();
  }
};

const publishOrderToExchange = (order) => {
  orderChannel.publish(EXCHANGE, "", Buffer.from(JSON.stringify(order)));
  logger.info(`AMQP - order ${order._id} placed`);
};

const injectExchangeService = (req, res, next) => {
  const exchangeServices = {
    publishOrderToExchange: publishOrderToExchange,
  };
  req.exchangeServices = exchangeServices;
  next();
};

module.exports = {
  injectExchangeService: injectExchangeService,
  amqpConnect: amqpConnect,
};
