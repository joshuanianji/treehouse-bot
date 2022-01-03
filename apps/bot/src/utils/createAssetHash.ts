// creates a hash of an NFT asset

import axios from 'axios';
import crypto from 'crypto';

export const hashText = (content: string): string => {
    const hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}

// download the file from the fileLink, and hash it
export const hashFile = async (fileLink: string): Promise<string> => {
    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const hash = crypto.createHash('md5');
    hash.update(response.data);
    return hash.digest('hex');
}