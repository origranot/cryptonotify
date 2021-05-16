const Discord = require('discord.js');
const discord = new Discord.Client();
import { Coin } from '../models/Coin';

export class DiscordBot {

    private _channelId: string;

    constructor(channelId: any) {

        this._channelId = channelId;

    }

    async login(token: any) {
        await discord.login(token);
    }


    newGemAlert = (coin: Coin) => {
        discord.channels.cache.get(this._channelId).send(`🚨 New CoinGecko Listing 🚨\n` +
            `${coin.name} / $${coin.symbol}\n` +
            `URL: https://www.coingecko.com/en/coins/${coin.id}\n\n` +
            `<@&843541384500609024>`);


    }
}