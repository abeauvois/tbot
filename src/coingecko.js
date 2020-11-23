const axios = require("axios");
const { of } = require("rxjs");
const { delay, map, switchMap, repeat } = require("rxjs/operators");

const getCoingeckoQuote = (currency) => {
  return {
    getQuotes: () =>
      Promise.all([
        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`),
        axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"),
      ]),
    toPrice: ([currencyData, tetherData]) => currencyData[currency].usd / tetherData.tether.usd,
  };
};

const CoingeckoTick$ = of({}).pipe(
  switchMap(() => getCoingeckoQuote("bitcoin").getQuotes()),
  map(([r1, r2]) => getCoingeckoQuote("bitcoin").toPrice([r1.data, r2.data])),
  //   tap(console.log),
  delay(3000),
  repeat()
);

module.exports = {
  CoingeckoTick$,
};
