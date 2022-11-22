const mongoose = require("mongoose");
const { logger } = require("./loggerService");

const MONGO_URI = process.env.MONGO_URI;

const mongoConnect = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(
    MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        logger.log("fatal", err);
        logger.log("trace", err.stack);
      }
    }
  );
  mongoose.connection.on("connected", function () {
    logger.log("info", `Mongoose - connection established at ${MONGO_URI}`);
  });

  mongoose.connection.on("error", function (err) {
    logger.log("fatal", `Mongoose - connection error: ${MONGO_URI}`);
  });

  mongoose.connection.on("disconnected", function () {
    logger.log("fatal", `Mongoose - disconnected: ${MONGO_URI}`);
  });
};

module.exports = {
  mongoConnect: mongoConnect,
};
