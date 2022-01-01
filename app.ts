import * as fs from 'fs';
import { exit } from 'process';
import { Coin, Site } from "./models/Declarations";
import fetch from 'node-fetch';
require('dotenv').config()

import { DiscordBot } from './classes/DiscordBot';
import { TwitterClient } from './classes/TwitterClient';

const discordBot = new DiscordBot()
const twitterClient = new TwitterClient(
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    process.env.TWITTER_ACCESS_KEY,
    process.env.TWITTER_ACCESS_SECRET
)

// Get the envirable variable
const DEVELOPMENT_ENV: boolean = process.env.ENV === "development";
const CMC_API_KEY: any = process.env.CMC_API_KEY;

var coinsArray: Coin[];


// Set up the coins file
const COINS_FILE: string = "coins.json";

/**
 * Function that loads coins from coins.txt to global variable.
 * @returns boolean wether the coins were loaded successfully or not
 */
const loadCoins = (): boolean => {
    try {
        var rawCoinsArray: any = fs.readFileSync(COINS_FILE);
        coinsArray = JSON.parse(rawCoinsArray);

    }
    catch (err) {
        console.error(err);
        return false;
    }
    return true;
}

/**
 * Function to save the coins into the file
 * @returns boolean wether the coins was saved successfully or not
 */
const saveCoinsFile = (): boolean => {
    fs.writeFile(COINS_FILE, JSON.stringify(coinsArray), (err) => {
        if (err) throw err;
        return true;
    });

    return false;
}


/**
 * Scrape CoinGecko for new recently added coins
 **/
const cgScrape = async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        const fetchedCoins: any[] = await response.json();
        checkForNewCoins(fetchedCoins, Site.CoinGecko);
    } catch (err) {
        console.error('Could not get CoinGecko info..')
    }
}

/**
 * Scrape CoinMarketCap for new recently added coins
 **/
const cmcScrape = async () => {
    try {
        const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?sort=date_added&sort_dir=desc', {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY
            }
        })
        const fetchedData = await response.json();
        const fetchedCoins: any[] = fetchedData.data;
        checkForNewCoins(fetchedCoins, Site.CoinMarketCap);
    } catch (err) {
        console.error('Could not get CoinMarketCap info..')
    }
}

/**
 * This function check for new coins in the new fetched array
 * @param fetchedCoinsArray The new coins array that just got fetched
 */
const checkForNewCoins = (fetchedCoinsArray: any[], currentSite: Site) => {
    let newCoinsFound: boolean = false;
    // Goes over the new coins and check for new coin
    for (let fetchedCoin of fetchedCoinsArray) {
        let idOfFetchedCoin: string = `${fetchedCoin.name}:(${fetchedCoin.symbol}):${currentSite}`;
        if (!isCoinExistInArray(idOfFetchedCoin, coinsArray)) {

            const newCoin: Coin = {
                id: idOfFetchedCoin,
                name: fetchedCoin.name,
                symbol: fetchedCoin.symbol,
                site: currentSite
            };

            let linkToTheNewCoin: string;
            switch (currentSite) {
                case Site.CoinMarketCap:
                    linkToTheNewCoin = `https://coinmarketcap.com/currencies/${fetchedCoin.slug}`
                    break;
                case Site.CoinGecko:
                    linkToTheNewCoin = `https://www.coingecko.com/en/coins/${fetchedCoin.id}`
                    break;
                default:
                    linkToTheNewCoin = ''
                    break;
            }

            if (DEVELOPMENT_ENV) { // Console.log if it's in development mode
                console.log('!!! NEW COIN HAS BEEN FOUND !!!')
                console.log(`URL: ${linkToTheNewCoin}`)
            } else {
                // Send message to discord server
                discordBot.newGemAlert(newCoin, linkToTheNewCoin);
                twitterClient.newGemAlert(newCoin, linkToTheNewCoin);
            }

            // Add the new coin to the global Array
            coinsArray.push(newCoin);
            newCoinsFound = true;
        }
    }

    if (newCoinsFound) {
        saveCoinsFile();
    }
}

/**
 * 
 * @param id id of coin to check wether exists
 * @param coinsArray array of coins
 * @returns wether the coin exists in this array
 */

/** */
const isCoinExistInArray = (id: string, coinsArray: Coin[]): boolean => {
    let isFound: boolean = false;
    coinsArray.some((currCoin => {
        if (currCoin.id === id) {
            return isFound = true;
        }
    }))

    return isFound;
}

/**
 * Start the code
 */
const start = async () => {

    // Check if this is prod environment
    if (!DEVELOPMENT_ENV) {
        try {
            await discordBot.login(process.env.DISCORD_TOKEN);
        } catch (err) {
            console.error('There was a problem login to discord..')
            exit();
        }
    }

    // load saved coins 
    if (!loadCoins()) {
        console.error(`There was a problem loading coins from ${COINS_FILE}`)
        exit();
    }


    cmcScrape();
    // cgScrape();
    console.log('Starting to monitor..')


    // // scrape every 30 seconds
    // setInterval(() => {
    //     console.log('Monitoring CoinGecko.. - ' + new Date().getMinutes());
    //     cgScrape();

    // }, 35000);

    // scrape every 5 minutes
    setInterval(() => {
        console.log('Monitoring CoinMarketCap.. - ' + new Date().getMinutes());
        cmcScrape();
    }, 5000);
}

start();
