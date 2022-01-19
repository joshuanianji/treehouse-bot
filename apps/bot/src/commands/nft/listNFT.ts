import axios from 'axios';
import { NFT, NFTType } from 'custom-types';
import { Either, right, left, fold as foldEither } from 'fp-ts/lib/Either';
import { fold as foldOption } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function';
import { UserNFTInfo, getServerError } from 'custom-types'
import { Message, MessageEmbed, EmbedFieldData } from 'discord.js';
import { truncate } from 'utils';
import { formatValidationErrors } from 'io-ts-reporters'
import { CONFIG } from '../../globals';


export const getUserNFTInfo = async (userId: string): Promise<Either<string, UserNFTInfo>> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        const { data } = await axios.get(`${server_host}/nft/user?id=${userId}`);
        return pipe(
            UserNFTInfo.decode(data.data),
            foldEither(
                (error) => {
                    console.error('Error decoding NFT info: ', formatValidationErrors(error));
                    return left('Error parsing NFT Info.')
                },
                (nftInfo) => right(nftInfo)
            )
        )
    } catch (err) {
        return pipe(
            getServerError(err),
            foldOption(
                () => {
                    console.error('Unknown error uploading NFT!', err);
                    return left('Unknown error uploading NFT!');
                },
                error => {
                    console.error('Error retrieving NFTs: ', error);
                    return left(`Error retrieving NFTs: ${error.code}`);
                }
            )
        )
    }
}

export const listNFTs = async (msg: Message, userId: string): Promise<Either<string, void>> => {
    const nftInfo = await getUserNFTInfo(userId);
    if (nftInfo._tag === 'Left') {
        return left(nftInfo.left);
    } else {
        const user = await msg.client.users.fetch(userId);
        const { count, numReturned, nfts } = nftInfo.right;
        const embedFields: EmbedFieldData[] = nfts.map(nft => ({
            name: 'NFT ID: ' + nft.id,
            value: 'Type: `' + nft.type._type + '`\n' + viewNftType(nft.type)
        }))
        const embed = new MessageEmbed()
            .setAuthor({ name: user.username, iconURL: user.avatarURL() || undefined })
            .setTitle('NFTs Owned by ' + user.username)

        // possibly add "truncated" field
        const websiteLink = `See all NFTs at ${CONFIG.devEnv.isDev ? `http://localhost:3000/user/${userId}` : `https://nft-bot.herokuapp.com/user/${userId}`}`;
        if (count > numReturned) {
            embed.addField(`${count} Total NFTs`, `Truncated to the show latest ${numReturned} NFTs.\n${websiteLink} `)
        } else {
            embed.addField(`${count} Total NFTs`, websiteLink)
        }
        embed.addFields(embedFields)

        await msg.channel.send({ embeds: [embed] });
        return right(undefined);
    }
}

const viewNftType = (nftType: NFTType): string => {
    if (nftType._type === 'asset') {
        return 'URL: ' + nftType.url;
    } else if (nftType._type === 'sticker') {
        return 'URL: ' + nftType.url;
    } else {
        const { truncated, str } = truncate(nftType.content, 64);
        return (truncated ? '*Text truncated to 64 characters:*\n"' + str + '"' : '"' + str + '"');
    }
}
