import { Command } from "../../interfaces";
import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import { hashFile, hashText } from '../../utils/createAssetHash';
import { NFT, NFTType } from 'custom-types';
import { AllowedContentTypes } from 'custom-types/src/nft';

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

                // Checking if the message works...
                if (repliedTo.type !== 'DEFAULT' && repliedTo.type !== 'REPLY') {
                    return msg.reply('Only default replies are supported.');
                }

                if (repliedTo.content.length === 0 && repliedTo.attachments.size === 0) {
                    return msg.reply('You need to reply to a message with text or an attachment to create an NFT');
                }

                // By this point, the message is either a text message or contains an attachment (or both)
                // This means it doesn't contain embeds or other unsupported content


                // Creating the NFT

                // prioritize attachments over text
                // if a message has an attachment and text, we NFTize the attachment
                let nftType: NFTType;
                if (repliedTo.attachments.size > 0) {
                    // get the first attachment always (TODO: support multiple attachments)
                    const [attachment] = repliedTo.attachments.values();

                    const contentType = attachment.contentType || 'unknown';
                    if (AllowedContentTypes.decode(contentType)._tag === 'Left') {
                        return repliedTo.reply(`Attachment type ${contentType} is not supported`);
                    }

                    nftType = {
                        _type: 'asset',
                        contentType: contentType as AllowedContentTypes, // linter isn't smart enough; i have to type cast
                        imgLink: attachment.url,
                    }
                } else {
                    // if there is no attachment, we NFTize the text
                    nftType = {
                        _type: 'text',
                        content: repliedTo.content,
                    }
                }

                console.log(NFTType.encode(nftType));
                return msg.channel.send(JSON.stringify(NFTType.encode(nftType)));
            } else {
                msg.reply('You need to reply to a message to create an NFT of it! (or of its media attachments)')
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

