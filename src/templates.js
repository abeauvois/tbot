const c = require("chalk");

const t = {
  spread: (spread) => `Spread: ${c.yellow(spread)} (${c.blue(spread * 100 + "%")})`,
};

module.exports = {
  t,
};
