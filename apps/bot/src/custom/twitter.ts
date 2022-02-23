import { Message } from 'discord.js'

const twitterWords = ["don't care", "didn't ask", "l + ratio", "soyjak", "beta", "cringe", "cope", "seethe", "ok boomer", "incel", "virgin", "karen", "🤡🤡🤡", "you are not just a clown, you are the entire circus", "💅💅💅", "nah this ain't it", "do better", "check your privilege", "pronouns in bio", "anime pfp", "🤢🤢🤮🤮", "the cognitive dissonance is real with this one", "😂🤣🤣", "lol copium", "snowflake", "🚩🚩🚩", "those tears taste delicious", "lisa simpson meme template saying that your opinion is wrong", "😒🙄🧐🤨", "wojak meme in which I'm the chad", "average your opinion fan vs average my opinion enjoyer", "random k-pop fancam", "cry more", "how's your wife's boyfriend doing", "cheetos breath", "intelligence 0", "r/whooooosh", "r/downvotedtooblivion", "blocked and reported", "yo Momma so fat", "go touch some grass", "cry about it", "get triggered", "comp sci", "eng sci", "eng", "premed", "mad?", "skill issue"]

interface Context {
    run: boolean; // if we should run
    triggeredWord: string; // the word that triggered the joke
}

/**
 * Checks if the message fulfills the "twitter ratio" criteria (starts with one of the twiter words)
 * @param word the message content
 * @returns 
 */
export const startsWith = (word: string): Context => {
    for (const triggerWord of twitterWords) {
        if (word.toLowerCase().startsWith(triggerWord)) {
            return {
                run: true,
                triggeredWord: triggerWord
            }
        }
    }
    return { run: false, triggeredWord: '' }
}

/**
 * Conditionally runs the twitter ratio message if the message fulfills the criteria
 * @param message the Discord message object
 * @param 
 */
export const runConditional = async (message: Message<boolean>, context: Context): Promise<void> => {
    if (context.run) {
        let returnWords: string[] = [];
        for (let i = 0; i < twitterWords.length; i++) {
            if (Math.random() > 0.5 && context.triggeredWord != twitterWords[i]) {
                returnWords.push(twitterWords[i])
            }
        }

        await message.channel.send({
            content: returnWords.join(' + '),
            files: ['https://media.discordapp.net/attachments/402306227809550359/945904082609127454/Drawing_Space.png']
        });
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}