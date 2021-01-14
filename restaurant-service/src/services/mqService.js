const amqp = require("amqplib");
const { processOrder } = require('../controllers/orderController')


// environment variables
const PREFETCH_COUNT = process.env.PREFETCH_COUNT || 2;

// create MQ connection string using environment variable
const MQ_HOST = process.env.MQ_HOST || 'localhost';
const MQ_URL = `amqp://${MQ_HOST}:5672`;
let orderChannel = null;

/**
 * Connect to RabbitMQ and consumer orders
 */
const amqpConnectAndConsume = async () => {
    try {
        const mqConnection = await amqp.connect(MQ_URL);
        console.info("AMQP connection established")
        
        orderChannel = await mqConnection.createChannel();
        
        var exchange = 'orders'
        await orderChannel.assertExchange(exchange, 'fanout', {
            durable: false
        });

        // Ensure that the queue exists or create one if it doesn't
        await orderChannel.assertQueue("order-queue");
        await orderChannel.bindQueue("order-queue", exchange, '');

        // Only process <PREFETCH_COUNT> orders at a time
        orderChannel.prefetch(PREFETCH_COUNT);

        orderChannel.consume("order-queue", order => {
            processOrder(order, orderChannel);
        });
    }
    catch (ex) {
        console.error(ex);
    }
}

module.exports = {
    amqpConnectAndConsume: amqpConnectAndConsume
}
