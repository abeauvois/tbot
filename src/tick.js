// HOW to use:

// const { poll$, CCTXTick$ } = require("./tick");
// CCTXTick$.subscribe();
// poll$.subscribe();

require("dotenv").config();

const ccxt = require("ccxt");

const { defer } = require("rxjs");
const { tap, switchMap, skipUntil } = require("rxjs/operators");

const { t, get2Digits } = require("./templates");
// CCTX ticker data
/* 
{
    'symbol':        string symbol of the market ('BTC/USD', 'ETH/BTC', ...)
    'info':        { the original non-modified unparsed reply from exchange API },
    'timestamp':     int (64-bit Unix Timestamp in milliseconds since Epoch 1 Jan 1970)
    'datetime':      ISO8601 datetime string with milliseconds
    'high':          float, // highest price
    'low':           float, // lowest price
    'bid':           float, // current best bid (buy) price
    'bidVolume':     float, // current best bid (buy) amount (may be missing or undefined)
    'ask':           float, // current best ask (sell) price
    'askVolume':     float, // current best ask (sell) amount (may be missing or undefined)
    'vwap':          float, // volume weighed average price
    'open':          float, // opening price
    'close':         float, // price of last trade (closing price for current period)
    'last':          float, // same as `close`, duplicated for convenience
    'previousClose': float, // closing price for the previous period
    'change':        float, // absolute change, `last - open`
    'percentage':    float, // relative change, `(change/open) * 100`
    'average':       float, // average price, `(last + open) / 2`
    'baseVolume':    float, // volume of base currency traded for last 24 hours
    'quoteVolume':   float, // volume of quote currency traded for last 24 hours
} */

const binanceExchange = new ccxt.binance({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
});

const getValidSymbol = async (exchange, asset = "BTC", base = "USDT") => {
  await exchange.loadMarkets();
  console.log(`/////////// "${exchange.id}" Markets loaded.`);

  const symbol = `${asset}/${base}`;
  const validSymbol = exchange.symbols && exchange.symbols.indexOf(symbol) > -1;

  console.log("Symbol: ", symbol, "valid:", validSymbol);
  if (!validSymbol) throw new Error(`Invalid symbol: ${symbol}`);
  return symbol;
};

const getExchange = async (exchange, asset = "BTC", base = "USDT") => {
  const symbol = await getValidSymbol(exchange, asset, base);

  return {
    getBalance: () => exchange.fetchBalance(),
    getTicker: () => exchange.fetchTicker(symbol),
    getBestPrice: async () => {
      let tick = await actions.getTicker();
      let orderbook = await exchange.fetchOrderBook(symbol);
      let bid = orderbook.bids.length ? orderbook.bids[0][0] : undefined;
      let ask = orderbook.asks.length ? orderbook.asks[0][0] : undefined;
      let spread = bid && ask ? get2Digits(ask - bid) : undefined;

      let pressure = get2Digits(tick.last - bid);

      return {
        bid,
        ask,
        spread,
        spot: tick.last,
        pressure,
        delta: pressure >= 0 ? `Buying(${pressure})` : `Selling(${pressure})`,
      };
    },
    cancelOrders: async () => {
      // Cancel open orders left from previous tick, if any
      const orders = await exchange.fetchOpenOrders(symbol);
      orders.forEach(async (order) => {
        await exchange.cancelOrder(order.id);
      });
    },

    sendOrder: async (marketPrice, allocation, spread) => {
      // const config = {
      //   allocation: 0.3, // Percentage of our available funds that we trade
      //   spread: 0.01, // = 1% => Percentage above and below market prices for sell and buy orders
      // };

      const balances = await exchange.fetchBalance();
      const assetBalance = balances.free[asset]; // e.g. 0.01 BT,
      const baseBalance = balances.free[base]; // e.g. 20 USD,

      const orderParams = {
        symbol,
        asset,
        base,
        buyPrice: get2Digits(marketPrice * (1 - spread)),
        sellPrice: get2Digits(marketPrice * (1 + spread)),
        buyVolume: get2Digits((baseBalance * allocation) / marketPrice),
        sellVolume: get2Digits(assetBalance * allocation),
        balances,
        assetBalance,
        baseBalance,
      };

      console.log(t.order({ ...orderParams }));

      //Send orders
      // await exchange.createLimitBuyOrder(symbol, buyVolume, buyPrice);
      // await exchange.createLimitSellOrder(symbol, sellVolume, sellPrice);

      return t.order({ ...orderParams });
    },

    getTrades: async () => {
      if (exchange.has["fetchTrades"]) {
        let since = exchange.milliseconds() - 86400000; // -1 day from now
        // alternatively, fetch from a certain starting datetime
        // let since = exchange.parse8601 ('2018-01-01T00:00:00Z')
        let allTrades = [];
        while (since < exchange.milliseconds()) {
          const limit = 20; // change for your limit
          const trades = await exchange.fetchTrades(symbol, since, limit);
          console.log("trades", trades);
          if (trades.length) {
            since = trades[trades.length - 1]["timestamp"];
            allTrades = allTrades.concat(trades);
          } else {
            break;
          }
        }
        return allTrades;
      }
    },

    // fetchTrades: (params) => {
    //   if (exchange.has["fetchTrades"]) {
    //     // sleep => mind the rateLimit!
    //     let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    //     Object.keys(exchange.markets).forEach(market => {
    //         // await sleep(exchange.rateLimit) // milliseconds
    //         await exchange.fetchTrades(symbol)
    //     })
    //   }
    // },

    diff: ([prev, curr]) => ({
      price: curr,
      dt: curr.timestamp - prev.timestamp,
      dp: curr.last - prev.last,
      percent: getPercent(prev.last, curr.last),
    }),

    toPrice: console.log, //([currencyData, tetherData]) => currencyData[currency].usd / tetherData.tether.usd,
  };
};

let actions;

const start$ = defer(async () => actions || (actions = await getExchange(binanceExchange, "ETH", "USDT")));

const sendOrder = ({ allocation, spread }) =>
  start$.pipe(
    skipUntil(start$),
    switchMap(() => actions.getBestPrice()),
    switchMap((price) => actions.sendOrder(price.spot, allocation, spread))
  );

const CCTXTick$ = start$.pipe(
  skipUntil(start$),
  switchMap(() => actions.getBestPrice()),
  // switchMap((price) => actions.sendOrder(price.spot,allocation, spread)),

  tap((tick) => console.log("tick:", tick))
  //   map(({ timestamp, datetime, last, percentage }) => ({ timestamp, datetime, last, percentage })),
  //   tap(console.log),
  //   delay(3000),
  //   repeat()
);

const poll$ = CCTXTick$
  .pipe
  //   pairwise(),
  //   map((a) => exchange.diff(a)),
  //   tap(console.log)
  //   filter(([prev, curr]) => prev !== curr),
  //   tap(([prev, curr]) => console.log("prev: ", prev, "curr: ", curr, "%:", getPercent(prev, curr)))
  ();

module.exports = {
  poll$,
  CCTXTick$,
  sendOrder,
};
