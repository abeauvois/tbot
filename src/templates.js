const c = require("chalk");

const get2Digits = (value) => Math.floor(value * 100) / 100;
const getPercent = (prev, curr) => get2Digits(((curr - prev) / prev) * 100);

const t = {
  allocation: ({ allocation }) => `Allocation: ${c.yellow(allocation)} (${c.blue(allocation * 100 + "%")})`,
  spread: ({ spread }) => `Spread: ${c.yellow(spread)} (${c.blue(spread * 100 + "%")})`,
  buy: ({ base, buyVolume, buyPrice }) =>
    `Creating limit buy order for ${buyVolume}@${buyPrice} = ${get2Digits(buyVolume * buyPrice)} ${base}`,
  sell: ({ asset, sellVolume, sellPrice }) =>
    `Creating limit sell order for ${sellVolume}@${sellPrice} = ${get2Digits(sellVolume * sellPrice)} ${asset}`,
  order: ({ symbol, asset, base, assetBalance, baseBalance, buyVolume, buyPrice, sellVolume, sellPrice }) => `
  New Order for ${c.blue(symbol)}...
  Asset balance: ${c.yellow.bold(assetBalance)} ${asset}
  Base balance: ${c.yellow.bold(baseBalance)} ${base}
  ${t.buy({ base, buyVolume, buyPrice })}
  ${t.sell({ asset, sellVolume, sellPrice })}
  `,
};

module.exports = {
  get2Digits,
  getPercent,
  t,
};
