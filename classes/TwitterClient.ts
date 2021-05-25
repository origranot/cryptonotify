const Twitter = require("twitter-lite");
import { Coin, Site } from '../models/Declarations';

export class TwitterClient {

    private client: any | undefined;

    constructor(consumer_key: any, consumer_secret: any, access_token_key: any, access_token_secret: any) {
        this.client = new Twitter({ consumer_key, consumer_secret, access_token_key, access_token_secret });
    }

    newGemAlert = (coin: Coin, link: string) => {
        let tweetString: String = `🚨 New ${coin.site} Listing 🚨\n` +
            `${coin.name} / $${coin.symbol}\n\n` +
            `#Defi #BSC #${coin.site}\n` +
            `${link}`;

        this.client.post("statuses/update", {
            status: tweetString
        }).catch((err: any) => {
            console.error(err);
        })
    }
}