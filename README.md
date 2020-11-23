# tbot :robot:

## Overview

This is a CLI trading bot

## Help result

```bash
tbot.js maker [allocation] [spread]

Market Maker

Arguments positionnels :
  allocation  Percentage of your current balance.              [défaut : "0.25"]
  spread      Percentage added to the bot selling price, substracted to the
              buying price.                                    [défaut : "0.01"]

Options :
  -h, --help     Show this help                                        [booléen]
      --version  Affiche le numéro de version                          [booléen]
  -v, --verbose  Run with verbose logging                              [booléen]
```

## Todos

- [ ] ...

## Install

```bash
cd YOUR_FOLDER
git clone https://github.com/abeauvois/tbot.git
yarn
```

Or

```bash
cd YOUR_FOLDER
git clone https://github.com/abeauvois/tbot.git
npm i
```

## 1. Run in the terminal

```bash
yarn start maker 0.2 0.3
```

## 2. For a report sent by email to yourself (via gmail):

It requires some devOps skills if you want to use `gmail` to send this report by email with it.

### Create an .env file (same place as package.json)

First, as we're using `gmail`, we have to setup a Google cloud project and get some key informations

Follow these instructions: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

The article explains `Why using Oauth2 and Google Dev App`

> many solutions required to go into my account settings and Enable Less Secure Apps. That sounded way too scary for me, especially considering I had been saved by Google’s security measures on more than a few occasions.
> So I found more efficient setting up OAuth2 for a Google Developer application and connecting it to the Nodemailer module using SMTP.

```bash
API_KEY=
API_SECRET=
GMAIL_EMAIL=
GMAIL_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_REFRESH_TOKEN=
PROJECT_NUMBER=
```

## Send

```bash
yarn start gmail ./csv/real-world-git-log.csv -v
```
