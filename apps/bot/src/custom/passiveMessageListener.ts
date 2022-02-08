import { Message } from 'discord.js';
import { truncate } from 'utils';


const triggerWords = ["i'm ", "im ", "i am "];

const startsWith = (word: string): { poggers: boolean, remaining: string } => {
    for (const triggerWord of triggerWords) {
        if (word.toLowerCase().startsWith(triggerWord)) {
            return {
                poggers: true,
                remaining: word.substring(triggerWord.length)
            }
        }
    }
    return { poggers: false, remaining: word }
}

const listener = async (message: Message<boolean>): Promise<void> => {
    if (message.author.bot) {
        return;
    }

    try {
        const { poggers, remaining } = startsWith(message.content);
        const { str } = truncate(remaining, 1900); // the max is 2000 chars, so we make room for our other msgs
        if (poggers) {
            // only run if Ahmad or Trevor sent it (id 239876252331278347 or 278587415378264064)
            if (message.author.id === '239876252331278347' || message.author.id === '278587415378264064') {
                await message.channel.send({
                    content: `You're not ${str}, you're ${message.author.toString()}!`,
                    files: ['https://c.tenor.com/9RBYPqpnSeUAAAAC/crying-emoji.gif']
                });
                console.log(`[INFO]: messageListener - Detected dad joke from ${message.author.username}: id - ${message.id}.`);
            }
        }
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