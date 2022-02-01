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
    const { poggers, remaining } = startsWith(message.content);
    if (poggers) {
        message.channel.send({
            content: `You're not ${remaining}, you're ${message.author.toString()}!`,
            files: ['https://c.tenor.com/9RBYPqpnSeUAAAAC/crying-emoji.gif']
        });
    }
}

export default listener;