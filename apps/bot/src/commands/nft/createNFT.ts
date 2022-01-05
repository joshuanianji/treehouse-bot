import { NFT } from 'custom-types';
import { Message } from 'discord.js';
import { Either, left, right } from 'fp-ts/lib/Either';
import { AllowedContentTypes, fromEssentials, nftAssetType, nftStickerType, nftTextType, NFTType } from 'custom-types/src/nft';
import { hashNFT } from '../../utils/hashNFT';
import axios from 'axios'

/**
 * Checks if the message is valid for creating an NFT
 * @param {Message} msg Discord message to check
 * @returns {Either<string, NFTType>} Either an error message or the repliedTo message
 */
const checkMsg = async (msg: Message): Promise<Either<string, Message>> => {
    if (!msg.reference || msg.type !== 'REPLY') {
        return left('Message is not a reply');
    }

    if (!msg.reference.messageId) {
        return left('You need to reply to a message to create an NFT');
    }

    const repliedTo = await msg.channel.messages.fetch(msg.reference.messageId);

    // Checking if the message works...
    if (repliedTo.type !== 'DEFAULT' && repliedTo.type !== 'REPLY') {
        return left('Only default replies are supported.');
    }

    if (repliedTo.content.length === 0 &&
        repliedTo.attachments.size === 0 &&
        repliedTo.stickers.size === 0) {
        return left('You need to reply to a message with text, attachment or sticker to create an NFT');
    }

    // By this point, the message is either a text message or contains an attachment (or both)
    // This means it doesn't contain embeds or other unsupported content

    return right(repliedTo);
}


/**
 * Uploads an NFT to the server 
 * 
 * @param {NFT} nft the NFT to upload
 */
const uploadNFT = async (nft: NFT): Promise<void> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        const { data } = await axios.post(`${server_host}/nft`, NFT.encode(nft), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('NFT Upload: ', data);
    } catch (error) {
        console.log('Error uploading NFT: ', (error as any).response.data);
        throw new Error('HTTP Error uploading NFT')
    }
}


/**
 * Gets the NFT Type from the message
 * 
 * Prioritizes attachments over text, so if a mesage has an atttachment and text, we NFTize the attachment
 * @param {Message} repliedTo the message to create an NFT from
 * @returns 
 */
const getNFTType = (repliedTo: Message): Either<string, NFTType> => {

    if (repliedTo.attachments.size > 0) {
        // get the first attachment always (TODO: support multiple attachments)
        const [attachment] = repliedTo.attachments.values();

        const contentType = attachment.contentType || 'unknown';
        const decoded = AllowedContentTypes.decode(contentType);
        if (decoded._tag === 'Left') {
            return left(`Attachment type ${contentType} is not supported`);
        }

        // size is in kilobytes
        if (attachment.size > 8 * 1024 * 1024) {
            return left('Attachment is too large to be NFTized. Max size is 8MB');
        }

        return right(nftAssetType(decoded.right, attachment.url));
    } else if (repliedTo.stickers.size > 0) {
        // get the first sticker always
        const [sticker] = repliedTo.stickers.values();

        return right(nftStickerType(sticker.url));
    } else {
        // if there is no attachment, we NFTize the text
        return right(nftTextType(repliedTo.content));
    }
}

/**
 * Creates and uploads the NFT
 * @param {Message} msg Discord message that called the NFT command
 * @returns {Either<string, void>} Either an error message or nothing
 */
export const createNFT = async (msg: Message): Promise<Either<string, void>> => {
    // Creating the NFT
    const msgChecked = await checkMsg(msg);
    if (msgChecked._tag === 'Left') {
        return left(msgChecked.left);
    }
    const repliedTo = msgChecked.right;

    const maybeNFTType = getNFTType(msgChecked.right);
    if (maybeNFTType._tag === 'Left') {
        return left(maybeNFTType.left);
    }
    const nftType = maybeNFTType.right;

    try {
        const creatingMsg = await msg.channel.send('Creating NFT...');

        const hash = await hashNFT(nftType);
        creatingMsg.edit(`Creating NFT... (hash: ${hash.substring(0, 10)})`);

        const nft = fromEssentials({
            from: repliedTo.author.id,
            ownedBy: msg.author.id,
            msgLink: repliedTo.id,
            hash,
            type: nftType,
        })
        console.log(nft);
        creatingMsg.edit(`Uploading NFT... (id: ${nft.id})`);

        // upload NFT to server
        await uploadNFT(nft);
        await creatingMsg.edit(`NFT created! (id: ${nft.id})`);
        return right(undefined);
    } catch (error) {
        console.error(error);
        return left(`Something went wrong while creating the NFT. Error: ${error}`);
    }
}
