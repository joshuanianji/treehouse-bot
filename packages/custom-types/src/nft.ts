import * as t from 'io-ts'

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
        _type: t.literal('asset'), // could be an image, could also be a video or something else
        contentType: AllowedContentTypes,
        imgLink: t.string, // we steal Discord's CDN to host the image (although this isn't immutable)
    })
])

type NFTType = t.TypeOf<typeof NFTType>


// the actual NFT type
const NFT = t.type({
    from: t.string, // original poster of the message (User ID)
    ownedBy: t.string, // who owns it (User ID)
    msgLink: t.string, // ID of the original message (which might not exist)
    msgLinkValid: t.boolean, // whether the message link is valid

    id: t.string, // the ID of the NFT (first 10 digits of the hash)
    fullHash: t.string, // full MD5 hash of the NFT asset 

    type: NFTType,
    createdAt: t.union([t.number, t.null]), // unix timestamp 
})

type NFT = t.TypeOf<typeof NFT>


// essential information to create an NFT
interface NFTEssentials {
    from: string,
    ownedBy: string,
    msgLink: string,

    hash: string, // will have to be pre generated

    type: NFTType,
    // createdAt will be generated when we push to Supabase
}
const createNFT = (data: NFTEssentials): NFT => ({
    from: data.from,
    ownedBy: data.ownedBy,
    msgLink: data.msgLink,
    msgLinkValid: true,

    id: data.hash.substring(0, 10),
    fullHash: data.hash,

    type: data.type,
    createdAt: null,
})

export { NFT, NFTType, AllowedContentTypes, createNFT }
