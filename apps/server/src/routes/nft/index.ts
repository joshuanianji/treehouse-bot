import express from 'express'
import { parseBody } from './../../middleware/parseBody';
import { parseQuery } from './../../middleware/parseQuery';
import { Config } from '../../util/config';
import * as i from 'io-ts'
import { NFT } from 'custom-types';
import * as user from './user'
import chalk from 'chalk';
import { formatValidationErrors } from 'io-ts-reporters';

// any other routes imports would go here

const router = express.Router()
router.use('/user', user.router);

// /nft?id=<nftId>
// returns the NFT, given the NFT id
const NftIDQuery = i.type({
    id: i.string,
})
router.get('/', parseQuery(NftIDQuery), async (req, res) => {
    console.log(`${chalk.green('[NFT]')} ${chalk.cyan('GET')} ${chalk.yellow('/')}`)
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

// uploads an NFT
router.post('/', parseBody(NFT), async (req, res) => {
    console.log(`${chalk.green('[NFT]')} ${chalk.cyan('POST')} ${chalk.yellow('/')}`)
    try {
        const nft = req.body;
        const { supabase, tableName } = Config.getSupabaseClient()

        const { data, error } = await supabase
            .from(tableName)
            .insert(nft)

        if (error) {
            if (error.code === '23505') {
                // duplicate key - NFT already exists
                // Check if the NFT is owned by the user
                const { data } = await supabase
                    .from(tableName)
                    .select(`fullHash, ownedBy`)
                    .eq('fullHash', nft.fullHash)

                const [remoteNFT] = data;

                if (remoteNFT.ownedBy === nft.ownedBy) {
                    return res.status(400).json({
                        code: 'NFT_ALREADY_OWNED',
                        title: 'NFT is already owned by the user!',
                    })
                } else {
                    // if they are not, throw an error saying that the NFT is already owned by someone else
                    return res.status(400).json({
                        code: 'NFT_ALREADY_OWNED_BY_OTHER',
                        title: 'NFT is already owned by someone else!',
                        details: {
                            ownedBy: remoteNFT.ownedBy
                        }
                    })
                }
            } else {
                console.log('Error uploading NFT: ', error)
                return res.status(500).json({
                    code: 'UNKNOWN_ERROR',
                    title: 'Error uploading NFT!',
                    error: JSON.stringify(error)
                })
            }
        }

        console.log('NFT upload success!')
        res.status(200).json({
            title: 'NFT upload success!',
            data: data
        })

    } catch (error) {
        console.log('Unknown error uploading NFT!', error)
        res.status(500).send({
            code: 'UNKNOWN_ERROR',
            title: 'Unknown error uploading NFT!',
            error: JSON.stringify(error)
        })
    }
})

export { router };
