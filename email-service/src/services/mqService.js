const amqp = require("amqplib");
const { sendConfirmation } = require("../controllers/emailController");
const { logger } = require("./loggerService");
const { EXCHANGE, QUEUE } = require("../resources/constants");
const PREFETCH_COUNT = parseInt(process.env.PREFETCH_COUNT) || 2;
const MQ_HOST = process.env.MQ_HOST || "localhost";
const MQ_URL = `amqp://${MQ_HOST}:5672`;
let orderChannel = null;

const amqpConnectAndConsume = async () => {
  try {
    const mqConnection = await amqp.connect(MQ_URL);
    logger.info(`AMQP - connection established at ${MQ_URL}`);

    orderChannel = await mqConnection.createChannel();

    await orderChannel.assertExchange(EXCHANGE, "fanout", {
      durable: false,
    });

    await orderChannel.assertQueue(QUEUE);
    await orderChannel.bindQueue(QUEUE, EXCHANGE, "");

    orderChannel.prefetch(PREFETCH_COUNT);

    orderChannel.consume(QUEUE, (order) => {
      sendConfirmation(order, orderChannel);
    });
  } catch (ex) {
    logger.log("fatal", `AMQP - ${ex}`);
    process.exit();
  }
};

module.exports = {
  amqpConnectAndConsume: amqpConnectAndConsume,
};
