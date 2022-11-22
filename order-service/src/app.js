const express = require("express");
const morgan = require("morgan");
const { addRoutes } = require("./routes/api");
const { MORGAN_CONFIG } = require("./resources/constants");
const { logger } = require("./services/loggerService");
const { errorHandlerMiddleware } = require("./services/errorHandlingService");
const { mongoConnect } = require("./services/mongoService");
const PORT = process.env.PORT || 3000;
const { injectExchangeService, amqpConnect } = require("./services/mqService");

startServer = () => {
  mongoConnect();

  amqpConnect();

  const app = express();

  app.use(morgan(MORGAN_CONFIG, { stream: logger.stream }));

  app.use(express.json());

  app.use(injectExchangeService);

  addRoutes(app);

  app.use(errorHandlerMiddleware);

  app.listen(PORT, () => {
    logger.info(`order-service listening on port ${PORT}`);
  });
};

module.exports = {
  startServer: startServer,
};
