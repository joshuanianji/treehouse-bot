import Client from "./client/client";
import passiveMessageListener from './custom/passiveMessageListener';


const client = new Client({
    intents: ["GUILD_MESSAGES", "GUILDS", "GUILD_BANS", "GUILD_MEMBERS", "DIRECT_MESSAGES"]
})

client.init().catch(console.error);

client.on('messageCreate', passiveMessageListener);
