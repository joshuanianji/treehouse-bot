import { parseQuery } from './../../middleware/parseQuery';
import { Config } from './../../util/supabase';
import express from 'express';
import * as i from 'io-ts';
import { NFT } from 'custom-types';
import { formatValidationErrors } from 'io-ts-reporters'
import chalk from 'chalk';

// root route: '/nft/info'
const router = express.Router()

// returns the NFT info, given the NFT id or hash
const NftIDQuery = i.type({
    id: i.string,
})
router.get('/', parseQuery(NftIDQuery), async (req, res) => {
    console.log(`${chalk.green('[NFT]')} ${chalk.cyan('GET')} ${chalk.yellow('/info')}`)
    const { id } = req.query;

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
        console.log('Error parsing NFT', formatValidationErrors(err));
        return res.status(500).send({
            code: 'PARSING_ERROR',
            title: 'Error parsing NFT',
            message: JSON.stringify(err)
        })
    } else {
        const nft: NFT = parsed.right;
        return res.status(200).json({
            data: nft
        })
    }
})

export { router };
