import { Message } from 'discord.js';


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
        if (poggers) {
            await message.channel.send({
                content: `You're not ${remaining}, you're ${message.author.toString()}!`,
                files: ['https://c.tenor.com/9RBYPqpnSeUAAAAC/crying-emoji.gif']
            });
            console.log(`[INFO]: messageListener - Detected dad joke from ${message.author.username}: id - ${message.id}.`);
        }
    } catch (e) {
        // send message with jerome sus imposter
        await message.channel.send({
            content: `Error in Passive Event Listener! Please contact bot owner lol.`,
            files: ['https://i.ytimg.com/vi/_GDkeCpT7tA/maxresdefault.jpg']
        });
        console.log('[ERROR]: messageListener - Error in passiveMessageListener: ', e);
    }
}

export default listener;