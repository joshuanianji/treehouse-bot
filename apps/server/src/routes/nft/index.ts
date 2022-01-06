import express from 'express'
import { parseBody } from './../../middleware/parseBody';
import { parseQuery } from './../../middleware/parseQuery';
import { Config } from './../../util/supabase';
import * as i from 'io-ts'
import { NFT } from 'custom-types';
import * as info from './info'

// any other routes imports would go here

const router = express.Router()
router.use('/info', info.router);

// get all NFTs from one person
const UserIDQuery = i.partial({
    userId: i.string
})
router.get('/', parseQuery(UserIDQuery), async (req, res) => {
    try {
        if (!req.query.userId) {
            // send the default response if no userId is provided
            return res.send('NFT root')
        }

        // get the userId from the query
        const userId = req.query.userId
        const { supabase, tableName } = Config.getSupabaseClient()
        // retrieve the NFTs from the database

        const { data, error } = await supabase
            .from(tableName)
            .select('id, createdAt, fullHash, ownedBy, type')
            .eq('ownedBy', userId)
            .order('createdAt', { ascending: false })
            .limit(5);

        if (error) {
            return res.status(500).send({
                code: 'UNKNOWN_ERROR',
                title: 'Error retrieving NFTs',
                detail: JSON.stringify(error)
            })
        }

        // send the NFTs to the client
        return res.status(200).json({
            count: data.length,
            nfts: data
        })

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});

// uploads an NFT
router.post('/', parseBody(NFT), async (req, res) => {
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

        console.log('NFT upload success! ', data)
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

