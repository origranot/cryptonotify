import * as fs from 'fs';
import { exit } from 'process';
import { Coin } from "./models/Coin";
import fetch from 'node-fetch';
const Audic = require('audic');

// Notification sound src
const NOTIFICATION_SRC: string = "/sounds/ding.mp3";


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
    }
    return (coinsArray.length !== 0);
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
const coingeckoScrape = () => {
    fetch('https://api.coingecko.com/api/v3/coins/list')
        .then(res => res.json())
        .then((fetchedCoins: Coin[]) => {

            let newCoinsFound: boolean = false;
            // Goes over the new coins and check for new coin
            for (let fetchedCoin of fetchedCoins) {
                if (!isCoinExistInArray(fetchedCoin, coinsArray)) {

                    // Play notification sounds
                    playNotificationSoundWithRepeat(NOTIFICATION_SRC, 5, 1000)

                    console.log('!!! NEW COIN HAS BEEN FOUND !!!')
                    console.log(`URL: https://www.coingecko.com/en/coins/${fetchedCoin.id}`)

                    // Add the new coin to the global Array
                    coinsArray.push(fetchedCoin);
                    newCoinsFound = true;
                }
            }

            if (newCoinsFound) {
                saveCoinsFile();
            }
        });
}

/**
 * 
 * @param coin single coin object
 * @param coinsArray array of coins
 * @returns wether the coin exists in this array
 */

/** */
const isCoinExistInArray = (coin: Coin, coinsArray: Coin[]): boolean => {
    let isFound: boolean = false;
    coinsArray.some((currCoin => {
        if (currCoin.id === coin.id) {
            return isFound = true;
        }
    }))

    return isFound;
}

/**
 * 
 * @param src Source of media file
 * @param numOfRepeat Number of repreats to the src media file
 * @param durationTime Duration time between each play of media file
 */
const playNotificationSoundWithRepeat = (src: string, numOfRepeat: number, durationTime: number) => {
    const notificationRepeatInterval: NodeJS.Timeout = setInterval(() => {
        if (numOfRepeat <= 0) {
            clearInterval(notificationRepeatInterval);
        }
        new Audic(src).play()
        numOfRepeat--;
    }, durationTime);
}


// load saved coins 
if (!loadCoins()) {
    console.error(`There was a problem loading coins from ${COINS_FILE}`)
    exit();
}


coingeckoScrape();
console.log('Starting to monitor..')

// scrape every 30 seconds
setInterval(() => {
    if (loadCoins()) {
        console.log('Monitoring... - ' + new Date().getMinutes());
        coingeckoScrape();
    }
}, 40000);