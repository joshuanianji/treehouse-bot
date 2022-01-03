import { Command } from "../../interfaces";
import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import { hashNFT } from '../../utils/hashNFT';
import { NFT, NFTType } from 'custom-types';
import { AllowedContentTypes, createNFT, nftAssetType, nftStickerType, nftTextType } from 'custom-types/src/nft';

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

                if (repliedTo.content.length === 0 &&
                    repliedTo.attachments.size === 0 &&
                    repliedTo.stickers.size === 0) {
                    return msg.reply('You need to reply to a message with text, attachment or sticker to create an NFT');
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
                    const decoded = AllowedContentTypes.decode(contentType);
                    if (decoded._tag === 'Left') {
                        return msg.reply(`Attachment type ${contentType} is not supported`);
                    }

                    // size is in kilobytes
                    if (attachment.size > 8 * 1024 * 1024) {
                        return msg.reply('Attachment is too large to be NFTized. Max size is 8MB');
                    }

                    nftType = nftAssetType(decoded.right, attachment.url);
                } else if (repliedTo.stickers.size > 0) {
                    // get the first sticker always
                    const [sticker] = repliedTo.stickers.values();

                    nftType = nftStickerType(sticker.url);
                } else {
                    // if there is no attachment, we NFTize the text
                    nftType = nftTextType(repliedTo.content);
                }

                const creatingMsg = await msg.channel.send('Creating NFT...');
                const hash = await hashNFT(nftType);
                creatingMsg.edit(`Creating NFT... (hash: ${hash.substring(0, 10)})`);

                const nft = createNFT({
                    from: repliedTo.author.id,
                    ownedBy: msg.author.id,
                    msgLink: repliedTo.id,
                    hash,
                    type: nftType,
                })
                console.log(nft);
                return creatingMsg.edit(`NFT created! (id: ${nft.id})`);
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

