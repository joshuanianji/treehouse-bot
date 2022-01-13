import express from 'express'
import { parseBody } from './../../middleware/parseBody';
import { parseQuery } from './../../middleware/parseQuery';
import { Config } from './../../util/supabase';
import * as i from 'io-ts'
import { UserNFTInfo } from 'custom-types/src/server/info';
import chalk from 'chalk';

// user requests
// each user is uniquely identified by their Discord ID


const router = express.Router();


// /nft/user?id=<userId>?limit=<limit>
// if limit is not specified, it defaults to 10
// if limit is 0, it returns all NFTs
// if start and end are specified, it returns all NFTs in the range (sorted by createdAt)

const UserIDQuery = i.partial({
    id: i.string,
    limit: i.number,
    start: i.number,
    end: i.number,
})
router.get('/', parseQuery(UserIDQuery), async (req, res) => {
    console.log(`${chalk.green('[NFT]')} ${chalk.cyan('GET')} ${chalk.yellow('/user')}`)
    try {
        if (!req.query.id) {
            // send the default response if no userId is provided
            return res.send('NFT root')
        }

        const { id } = req.query
        const sizeLimit = (req.query.limit || 5) // default to 5 if no limit is provided

        const { supabase, tableName } = Config.getSupabaseClient()
        // retrieve the NFTs from the database

        const nfts = supabase
            .from(tableName)
            .select('id, createdAt, fullHash, ownedBy, type, msgLink, msgLinkValid, from')
            .eq('ownedBy', id)
            .order('createdAt', { ascending: false })

        if (sizeLimit > 0) {
            nfts.limit(sizeLimit);
        }

        // retrieve the NFTs owned by the user
        const countNFTs = supabase
            .from(tableName)
            .select('id', { count: 'exact' })
            .eq('ownedBy', id);

        const [
            { data: nftData, error: nftError },
            { data: countData, error: countError }
        ] = await Promise.all([nfts, countNFTs]);

        if (nftError) {
            console.log('Error retrieving NFTs: ', nftError);
            return res.status(500).send({
                code: 'UNKNOWN_ERROR',
                title: 'Error retrieving NFTs',
                detail: JSON.stringify(nftError)
            })
        }

        if (countError) {
            console.log('Error Counting NFTs: ', countError)
            return res.status(500).send({
                code: 'UNKNOWN_ERROR',
                title: 'Error Counting NFTs',
                detail: JSON.stringify(countError)
            })
        }

        // send the NFTs to the client
        const returnVal: UserNFTInfo = {
            count: countData.length,
            limit: sizeLimit,
            nfts: nftData
        }
        console.log('Returning NFTs: ', { count: returnVal.count, limit: returnVal.limit, nftsLength: returnVal.nfts.length })
        return res.status(200).json(returnVal)

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});

export { router };