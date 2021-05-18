const Discord = require('discord.js');
const discord = new Discord.Client();
import { Coin, Site } from '../models/Declarations';

export class DiscordBot {

    constructor() { }

    async login(token: any) {
        await discord.login(token);
    }

    newGemAlert = (coin: Coin, link: string) => {

        // Get the channel id from the .env config
        const channelId: any = (coin.site === Site.CoinGecko) ? process.env.DISCORD_CHANNEL_CG_ID : process.env.DISCORD_CHANNEL_CMC_ID;
        const tagRule: string = (coin.site === Site.CoinGecko) ? '843541384500609024' : '844203118119354368';

        // Send the message to the correct channel
        discord.channels.cache.get(channelId).send(`🚨 New ${coin.site} Listing 🚨\n` +
            `${coin.name} / $${coin.symbol}\n` +
            `URL: ${link}\n\n` +
            `<@&${tagRule}>`);
    }
}