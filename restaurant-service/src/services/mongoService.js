const mongoose = require("mongoose");
const { logger } = require("./loggerService");

const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI: ", MONGO_URI);

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
        console.error("Mongo ERROR " + err);
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

const changeOrderStatus = (OrderModel, orderId, status) => {
  OrderModel.findByIdAndUpdate(orderId, { status: status }, (err, order) => {
    if (err) {
      logger("fatal", `Mongoose - ${err}`);
    } else {
      logger.info(`Order - ${orderId} ${status}`);
    }
  });
};

module.exports = {
  mongoConnect: mongoConnect,
  changeOrderStatus: changeOrderStatus,
};
