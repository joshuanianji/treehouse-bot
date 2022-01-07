import * as i from 'io-ts';
import { NFT } from '../nft';

// the NFTs the user has
export const UserNFTInfo = i.type({
    count: i.number, // total count
    limit: i.number,
    nfts: i.array(NFT),
})
export type UserNFTInfo = i.TypeOf<typeof UserNFTInfo>
