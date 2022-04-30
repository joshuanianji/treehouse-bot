import { Message } from 'discord.js';
import { pass } from 'fp-ts/lib/Writer';
import * as dadJoke from './dadJoke';
import * as twitter from './twitter';

const listener = async (message: Message<boolean>): Promise<void> => {
    if (message.author.bot) {
        return;
    }
    return;
}

export default listener;