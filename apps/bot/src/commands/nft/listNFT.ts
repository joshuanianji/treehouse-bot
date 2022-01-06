import axios from 'axios';
import { NFT } from 'custom-types';
import { Either, right, left } from 'fp-ts/lib/Either';
import { fold } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function';
import { server } from 'custom-types'
import { Message, MessageEmbed, EmbedFieldData } from 'discord.js';

interface NFTListResponse {
    nfts: NFT[];
    count: number
}
export const getNFTs = async (userId: string): Promise<Either<string, NFT[]>> => {
    try {
        const server_host = process.env.SERVER_HOST || 'http://localhost:3001';
        const { data } = await axios.get<NFTListResponse>(`${server_host}/nft?userId=${userId}`);
        console.log('NFT Upload: ', data);
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
        const nfts: Array<NFT> = nftRes.right;
        const embedFields: EmbedFieldData[] = nfts.map(nft => ({
            name: 'NFT ID: ' + nft.id,
            value: nft.fullHash
        }))
        const embed = new MessageEmbed()
            .setTitle('Your NFTs')
            .addFields(embedFields)
        await msg.channel.send({ embeds: [embed] });
        return right(undefined);
    }
}
