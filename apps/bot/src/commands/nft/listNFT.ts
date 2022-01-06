import axios from 'axios';
import { NFT, NFTType } from 'custom-types';
import { Either, right, left } from 'fp-ts/lib/Either';
import { fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function';
import { server } from 'custom-types'
import { Message, MessageEmbed, EmbedFieldData } from 'discord.js';
import { truncate } from '../../utils';

interface NFTListResponse {
    nfts: NFT[];
    count: number
}
export const getNFTs = async (userId: string): Promise<Either<string, NFT[]>> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        const { data } = await axios.get<NFTListResponse>(`${server_host}/nft?userId=${userId}`);
        return right(data.nfts)
    } catch (err) {
        return pipe(
            server.getServerError(err),
            fold(
                () => {
                    console.error('Unknown error uploading NFT!', err);
                    return left('Unknown error uploading NFT!');
                },
                error => {
                    console.log('Error retrieving NFTs: ', error);
                    return left(`Error retrieving NFTs: ${error.code}`);
                }
            )
        )
    }
}

export const listNFTs = async (msg: Message, userId: string): Promise<Either<string, void>> => {
    const nftRes = await getNFTs(userId);
    if (nftRes._tag === 'Left') {
        return left(nftRes.left);
    } else {
        const user = await msg.client.users.fetch(userId);
        const nfts: Array<NFT> = nftRes.right;
        const embedFields: EmbedFieldData[] = nfts.map(nft => ({
            name: 'NFT ID: ' + nft.id,
            value: 'Type: `' + nft.type._type + '`\n' + viewNftType(nft.type)
        }))
        const embed = new MessageEmbed()
            .setAuthor({ name: user.username, iconURL: user.avatarURL() || undefined })
            .setTitle('NFTs Owned by ' + user.username)
            .addField(`${nfts.length} Total NFTs`, 'Truncated to the latest 10', false)
            .addFields(embedFields)
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
