import { parseQuery } from './../../middleware/parseQuery';
import { Config } from './../../util/supabase';
import express from 'express';
import * as i from 'io-ts';
import { NFT } from 'custom-types';
import * as info from './info'

// root route: '/nft/info'
const router = express.Router()

// returns the NFT info, given the NFT id or hash
const NftIDQuery = i.type({
    id: i.string
})
router.get('/', parseQuery(NftIDQuery), async (req, res) => {
    const { id } = req.query;
    // id is the ten-element NFT id
    const { supabase, tableName } = Config.getSupabaseClient()
    // retrieve the NFTs from the database

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .order('createdAt', { ascending: false })

    if (error) {
        return res.status(500).send({
            code: 'SUPABASE_ERROR',
            title: 'Error retrieving NFTs',
            message: JSON.stringify(error)
        })
    }

    if (data.length === 0) {
        return res.status(404).send({
            code: 'NFT_NOT_FOUND',
            title: 'NFT not found',
            message: `NFT with id ${id} not found`
        })
    }

    const [unparsedNFT] = data;
    const parsed = NFT.decode(unparsedNFT);
    if (parsed._tag === 'Left') {
        const err = parsed.left;
        console.log('Error parsing NFT', { err })
        return res.status(500).send({
            code: 'PARSING_ERROR',
            title: 'Error parsing NFT',
            message: JSON.stringify(err)
        })
    } else {
        const nft: NFT = parsed.right;
        // send the NFTs to the client
        return res.status(200).json({
            data: nft
        })
    }
})

export { router };

