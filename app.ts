import * as fs from 'fs';
import { exit } from 'process';
import { Coin } from "./models/Coin";
import fetch from 'node-fetch';


var coinsArray: Coin[];

const COINS_FILE: string = "coins.json";

/**
 * Function that loads coins from coins.txt to global variable.
 **/

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
 * Save the coins file according to the global array
 **/
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

const isCoinExistInArray = (coin: Coin, coinsArray: Coin[]): boolean => {
    let isFound: boolean = false;
    coinsArray.some((currCoin => {
        if (currCoin.id === coin.id) {
            return isFound = true;
        }
    }))

    return isFound;
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
        console.log('Monitoring...')
        coingeckoScrape();
    }
}, 15000);