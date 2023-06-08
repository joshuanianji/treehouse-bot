import { Message } from 'discord.js';
import * as dadJoke from './dadJoke';
import * as twitter from './twitter';

const listener = async (message: Message<boolean>): Promise<void> => {
    if (message.author.bot) {
        return;
    }

    try {
        const dadJokeCtx = dadJoke.startsWith(message.content);
        // const twitterCtx = twitter.startsWith(message.content);

        dadJoke.runConditional(message, dadJokeCtx);
        // twitter.runConditional(message, twitterCtx);

    } catch (e) {
        // send message with jerome sus imposter
        await message.channel.send({
            content: `Error in Passive Message Listener! Please contact bot owner lol.`,
            files: ['https://i.ytimg.com/vi/_GDkeCpT7tA/maxresdefault.jpg']
        });
        console.log('[ERROR]: messageListener - Error in passiveMessageListener: ', e);
    }
}


export default listener;
