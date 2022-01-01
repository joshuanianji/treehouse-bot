import { Command } from "../../interfaces";
import axios from 'axios'
import { EmbedFieldData, Message, MessageEmbed } from "discord.js";

export const command: Command = {
    description: "Creates an NFT of the replied message",
    example: ["!nft"],
    group: "other",
    name: "nft",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, _args) => {
        try {
            if (msg.reference && msg.type === 'REPLY') {
                if (!msg.reference.messageId) {
                    msg.reply('You need to reply to a message to create an NFT')
                    return;
                }

                const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId);
                console.log(`Replied to content: '${repliedTo.content}'`);

                const attachments = getAttachments(repliedTo);
                const embed = new MessageEmbed()
                    .setTitle('Message Data:')
                    .addField('Message content', repliedTo.content || 'No content')
                    .addField('Message Type', repliedTo.type)
                    .addFields(...attachments);
                return msg.channel.send({ embeds: [embed] })
            } else {
                msg.reply('You need to reply to a message to create an NFT')
            }
        } catch (e) {
            console.error(e);
            const embed = new MessageEmbed()
                .setTitle('Something went wrong!')
                .addField('Error', JSON.stringify(e), false)
            return msg.channel.send({ embeds: [embed] });
        }
    }
};


const getAttachments = (message: Message<boolean>): EmbedFieldData[] => {
    if (message.attachments.size === 0) {
        return [];
    }

    return message.attachments.map(a => ({
        name: 'Attachment id ' + a.id,
        value: 'ContentType: ' + a.contentType,
        inline: true
    }));
}
