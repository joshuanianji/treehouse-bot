// creates a hash of an NFT asset

import axios from 'axios';
import crypto from 'crypto';
import { NFTType } from 'custom-types';

// general hash function
const hashContent = (content: string): string => {
    const hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}


// creates a hash of the NFT asset
export const hashNFT = async (nft: NFTType): Promise<string> => {
    switch (nft._type) {
        case 'text':
            return hashContent(nft.content);
        case 'asset':
            const { data } = await axios.get(nft.url);
            return hashContent(data);
        case 'sticker':
            const { data: stickerData } = await axios.get(nft.url);
            return hashContent(stickerData);
    }
}