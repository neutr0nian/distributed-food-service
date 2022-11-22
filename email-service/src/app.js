const { amqpConnectAndConsume } = require("./services/mqService");

const startServer = () => {
  amqpConnectAndConsume();
};

module.exports = {
  startServer: startServer,
};
