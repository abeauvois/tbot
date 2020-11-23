const { sendOrder } = require("./tick");

const maker = ({ allocation, spread }) => {
  sendOrder({ allocation, spread }).subscribe();
};

module.exports = {
  maker,
};
