import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { createNFT } from './createNFT';
import { listNFTs } from './listNFT'

export const command: Command = {
    description: "Creates an NFT of the replied message",
    example: [".nft"],
    group: "other",
    name: "nft",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, _args) => {
        if (_args.length === 0) {
            return msg.channel.send('Please provide an argument (valid arguments are: create, list, penis)');
        }
        try {
            switch (_args[0]) {
                case 'create':
                    const res = await createNFT(msg);
                    if (res._tag === 'Left') {
                        return msg.reply(res.left);
                    }
                    break;
                case 'list':
                    await msg.channel.sendTyping();
                    const resNfts = await listNFTs(msg, msg.author.id);
                    if (resNfts._tag === 'Left') {
                        return msg.reply(resNfts.left);
                    }
                    break;
                case 'penis':
                    return msg.channel.send('penis');
                default:
                    return msg.channel.send('Unknown argument (valid arguments are: create, list, penis)');
            }
        } catch (e) {
            console.error(e);
            const embed = new MessageEmbed()
                .setTitle('Something went wrong!')
                .addField('Error', JSON.stringify(e).substring(0, 1023), false)
            return msg.channel.send({ embeds: [embed] });
        }
    }
};
