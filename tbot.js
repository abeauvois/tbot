#!/usr/bin/env node

require("dotenv").config();
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { t } = require("./src/templates");
const { maker } = require("./src/maker");
const { gmail } = require("./src/gmail");

yargs(hideBin(process.argv))
  .command(
    "maker [spread]",
    "Market Maker",
    (yargs) => {
      yargs.positional("spread", {
        describe: "Percentage added to the bot selling price, substracted to the buying price.",
        default: "0.01",
      });
    },
    (argv) => {
      console.info(t.spread(argv.spread));
      maker({ spread: argv.spread });
    }
  )
  .command(
    "gmail [filename]",
    "Send report by email",
    (yargs) => {
      yargs.positional("filename", {
        describe: "CSV filename ie: ./csv/transactions.csv",
        default: "./csv/transactions.csv",
      });
    },
    (argv) => {
      if (argv.verbose) console.info(`Report from :${argv.filename} sent to: ${process.env.GMAIL_EMAIL}`);
      gmail({ filename: argv.filename });
    }
  )
  .option("help", {
    alias: "h",
    type: "boolean",
    description: "Show this help",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  }).argv;
