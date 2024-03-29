import * as t from 'io-ts';
import { sparseType, optional } from 'io-ts-extra';
import * as O from 'fp-ts/lib/Option';

const AllowedContentTypes = t.union([
    t.literal('image/png'),
    t.literal('image/jpeg'),
    t.literal('image/gif'),
    t.literal('video/mp4'),
])
type AllowedContentTypes = t.TypeOf<typeof AllowedContentTypes>

// either a Text or an Image
const NFTType = t.union([
    t.type({
        _type: t.literal('text'),
        content: t.string,
    }),
    t.type({
        _type: t.literal('asset'), // could be an image, could also be a video or sticker
        contentType: AllowedContentTypes,
        url: t.string, // we steal Discord's CDN to host the image (although this isn't immutable)
    }),
    // note that for stickers, the URL is already a unique identifier
    // no need to hash the actual sticker
    t.type({
        _type: t.literal('sticker'), // could be an image, could also be a video or sticker
        url: t.string, // we steal Discord's CDN to host the image (although this isn't immutable)
    })
])
type NFTType = t.TypeOf<typeof NFTType>

export const nftTextType = (content: string): NFTType => ({
    _type: 'text',
    content,
})
export const nftAssetType = (contentType: AllowedContentTypes, url: string): NFTType => ({
    _type: 'asset',
    contentType,
    url,
})
export const nftStickerType = (url: string): NFTType => ({
    _type: 'sticker',
    url,
})


// the actual NFT type
const NFT = sparseType({
    from: t.string, // original poster of the message (User ID)
    ownedBy: t.string, // who owns it (User ID)
    msgLink: t.string, // ID of the original message (which might not exist)
    msgLinkValid: t.boolean, // whether the message link is valid

    id: t.string, // the ID of the NFT (first 10 digits of the hash)
    fullHash: t.string, // full MD5 hash of the NFT asset 

    type: NFTType,
    createdAt: t.string, // ISO string

    // metadata that helps us create links
    // unfortunately, I overlooked these when i initially wrote the bot, 
    // so some are null
    guildId: optional(t.string),
    channelId: optional(t.string),
})

type NFT = t.TypeOf<typeof NFT>

const getMsgLink = (nft: NFT): O.Option<string> => {
    if (nft.guildId && nft.channelId) {
        return O.some(`https://discordapp.com/channels/${nft.guildId}/${nft.channelId}/${nft.id}`)
    } else {
        return O.none
    }
}

// essential information to create an NFT
interface NFTEssentials {
    from: string,
    ownedBy: string,
    msgLink: string,

    hash: string, // will have to be pre generated

    type: NFTType,
    // createdAt will be generated when we push to Supabase

    guildId?: string,
    channelId?: string,
}
export const fromEssentials = (data: NFTEssentials): NFT => ({
    from: data.from,
    ownedBy: data.ownedBy,
    msgLink: data.msgLink,
    msgLinkValid: true,

    id: data.hash.substring(0, 10),
    fullHash: data.hash,

    type: data.type,
    // https://github.com/supabase/supabase/discussions/2839
    createdAt: ((new Date()).toISOString()).toLocaleString(),

    guildId: data.guildId,
    channelId: data.channelId,
})

export { NFT, NFTType, AllowedContentTypes, getMsgLink }
