import { NFT, server } from 'custom-types';
import { Either, right, left, fold, mapLeft, fromOption, isLeft } from 'fp-ts/lib/Either';
import axios from 'axios';
import { pipe } from 'fp-ts/lib/function'
import { formatValidationErrors } from 'io-ts-reporters'
import { MessageEmbed, Message } from 'discord.js';
import ExtendedClient from '../../client/client';
import { truncate } from '../../utils';

// gets an NFT given the ID 
export const getNFT = async (id: string): Promise<Either<string, NFT>> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        const { data } = await axios.get(`${server_host}/nft/info?id=${id}`);

        return pipe(
            NFT.decode(data.data),
            mapLeft(
                (err) => {
                    console.log('Error decoding NFT: ', err);
                    return formatValidationErrors(err).join('\n');
                }
            )
        )
    } catch (err) {
        return pipe(
            server.getServerError(err),
            fromOption(() => 'Unknown error'),
            fold(
                _ => {
                    console.error('Unknown error uploading NFT!', err);
                    return left('Unknown error uploading NFT! Please contact the bot owner.');
                },
                error => {
                    if (error.code === 'SUPABASE_ERROR') {
                        return left(`Database error! ${error.title}`);
                    } else if (error.code === 'NFT_NOT_FOUND') {
                        return left(`No NFT found with ID: ${id}`);
                    } else if (error.code === 'PARSING_ERROR') {
                        return left(`\'PARSING_ERROR\`: Server parsing error! ${error.message}`);
                    } else {
                        return left(`Unknown error uploading NFT!`);
                    }
                }
            )
        )
    }
}

// turns an NFT into an embed
export const nftToEmbed = async (client: ExtendedClient, nft: NFT): Promise<MessageEmbed> => {
    const user = await client.users.fetch(nft.ownedBy);

    const embed = new MessageEmbed()
        .setTitle(`NFT \`${nft.id}\` owned by ${user.username}`)
        .setAuthor({ name: user.username, iconURL: user.avatarURL() || undefined })
        .setDescription(`Created at: ${new Date(nft.createdAt).toLocaleString()}`)
        .addField('Full Hash:', nft.fullHash, false)
        .setFooter({
            text: 'Created by Joshua Ji and Curtis Kan. DM us for any questions!',
            iconURL: client.user?.avatarURL() || undefined
        });

    // add field for each attribute
    if (nft.type._type === 'asset') {
        embed.addFields([{ name: `Type: \`Asset\`: ${nft.type.contentType}`, value: nft.type.url }]);
        embed.setImage(nft.type.url);
    } else if (nft.type._type === 'sticker') {
        embed.addFields([{ name: 'Type: `Sticker`', value: nft.type.url }]);
        embed.setImage(nft.type.url);
    } else {
        const { truncated, str } = truncate(nft.type.content, 900); // max is technically 1024 chars for a field value, but we're being safe
        if (truncated) {
            embed.addFields([{ name: 'Type: `Text`', value: '**NOTE: String exceeds 1000 char length, displaying truncated string.**\n\n' + str + '\n' }]);
        } else {
            embed.addFields([{ name: 'Type: `Text`', value: str }]);
        }
    }

    return embed;
}

// should probably convert to using their TaskEither type (which is the monadic version of TS Promises)
export const getInfo = async (client: ExtendedClient, msg: Message, id: string): Promise<Either<string, void>> => {
    // make sure ID is a string of ascii characters 10 characters long
    const re = /[0-9A-Fa-f]{10}/g;
    if (!re.test(id)) {
        return left(`Invalid id \`${id}\`. Please provide a valid NFT ID (10 character hex digit)`);
    }

    const res = await getNFT(id);

    if (isLeft(res)) {
        return left(res.left);
    }

    const embed = await nftToEmbed(client, res.right);
    await msg.channel.send({ embeds: [embed] });

    return right(undefined);
}



