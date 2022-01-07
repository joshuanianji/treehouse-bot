import { AllowedContentTypes, fromEssentials, nftAssetType, nftStickerType, nftTextType, NFTType } from 'custom-types/src/nft';
import { formatValidationErrors } from 'io-ts-reporters';
import { Either, left, right, fold, fromOption } from 'fp-ts/lib/Either';
import { hashNFT } from '../../utils/hashNFT';
import { pipe } from 'fp-ts/lib/function';
import { ErrorWithContext, server } from 'custom-types'
import { Message } from 'discord.js';
import { NFT } from 'custom-types';
import axios from 'axios';


// This file provides helper function for the `.nft create` command


/**
 * Checks if the message is valid for creating an NFT
 * @param {Message} msg Discord message to check
 * @returns {Either<string, NFTType>} Either an error message or the repliedTo message
 */
export const checkMsg = async (msg: Message): Promise<Either<string, Message>> => {
    if (!msg.reference || msg.type !== 'REPLY') {
        return left('You need to reply to a message to create an NFT of that message');
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
 * Returns the error message if any came up
 * 
 * Note that I use a weird error system, where I return a function because I need asynchronous actions on error
 * I am a bit hesitant about using this in general, but it works now.
 * 
 * @param {NFT} nft the NFT to upload
 */
const uploadNFT = async (msg: Message, nft: NFT): Promise<Either<ErrorWithContext<Message>, void>> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        await axios.post(`${server_host}/nft`, NFT.encode(nft), {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Uploaded nft to server: ', nft.id);
        return right(undefined);
    } catch (err) {
        return pipe(
            server.getServerError(err),
            fromOption(() => 'Unknown error'), // left means the error is not from the server
            fold(
                () => {
                    console.error('Unknown error uploading NFT!', err);
                    return left(() => Promise.resolve('Unknown error uploading NFT!'));
                },
                error => {
                    if (error.code === 'NFT_ALREADY_OWNED') {
                        return left(() => Promise.resolve(`You already own this NFT! \`ID: ${nft.id}\``));
                    } else if (error.code === 'NFT_ALREADY_OWNED_BY_OTHER') {
                        const getError = async (msg: Message) => {
                            const ownedBy = await msg.client.users.fetch(error.details.ownedBy);
                            return `${ownedBy.username} already owns this NFT! \`ID: ${nft.id}\``
                        }
                        return left(getError);
                    } else {
                        return left(() => Promise.resolve(`Unknown error uploading NFT!`));
                    }
                }
            )
        )
    }
}


/**
 * Gets the NFT Type from the message
 * 
 * Prioritizes attachments over text, so if a mesage has an atttachment and text, we NFTize the attachment
 * @param {Message} repliedTo the message to create an NFT from
 * @returns 
 */
export const getNFTType = (repliedTo: Message): Either<string, NFTType> => {

    if (repliedTo.attachments.size > 0) {
        // get the first attachment always (TODO: support multiple attachments)
        const [attachment] = repliedTo.attachments.values();

        const contentType = attachment.contentType || 'unknown';
        const decoded = AllowedContentTypes.decode(contentType);
        if (decoded._tag === 'Left') {
            return left(`Attachment type \`${contentType}\` is not supported`);
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
        console.log('Created NFT: ', nft.id);
        creatingMsg.edit(`Uploading NFT... (id: ${nft.id})`);

        // upload NFT to server
        const mErr = await uploadNFT(msg, nft);
        if (mErr._tag === 'Left') {
            const err = await mErr.left(msg);
            creatingMsg.edit(`Error uploading NFT: ${err}`);
            return right(undefined) // we don't need to message the user again when there is an error here
        }
        await creatingMsg.edit(`NFT created! (id: ${nft.id})`);
        return right(undefined);
    } catch (error) {
        console.error('Error creating NFT:', error);
        return left(`Something went wrong while creating the NFT. Error: ${error}`);
    }
}
