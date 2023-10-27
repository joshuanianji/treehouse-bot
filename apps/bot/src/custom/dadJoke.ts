import { Message } from 'discord.js';
import { truncate } from 'utils';

interface DadJokeReturn { run: boolean, remaining: string };

const triggerWords = ["i'm ", "im ", "i am "];

/**
 * Checks if the message starts with one of the trigger words
 * @param word the message content
 * @returns DadJokeReturn object
 */
export const startsWith = (word: string): DadJokeReturn => {
    for (const triggerWord of triggerWords) {
        if (word.toLowerCase().includes(triggerWord)) {
            return {
                run: true,
                remaining: word.substring(word.indexOf(triggerWord) + triggerWord.length)
            }
        }
    }
    return { run: false, remaining: word }
}

/**
 * Conditionally runs the dad joke if the message starts with the trigger words.
 * @param message the Discord message object
 * @param context The context
 */
export const runConditional = async (message: Message<boolean>, context: DadJokeReturn): Promise<void> => {
    if (context.run) {
        // only run if Ahmad or Trevor sent it (id 239876252331278347 or 278587415378264064) >:)))
        if (message.author.id === '239876252331278347' || message.author.id === '278587415378264064' || message.author.id === '256212924723363844') {
            await message.channel.sendTyping();
            const { str } = truncate(context.remaining, 1900); // the max is 2000 chars, so we make room for our other msgs

            await message.channel.send({
                content: `You're not ${str}, you're ${message.author.toString()}!`,
                files: ['https://c.tenor.com/9RBYPqpnSeUAAAAC/crying-emoji.gif']
            });
            console.log(`[INFO]: messageListener - Detected dad joke from ${message.author.username}: id - ${message.id}.`);
        }
    }
}
