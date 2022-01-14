import express from 'express'
import { parseBody } from './../../middleware/parseBody';
import { parseQuery } from './../../middleware/parseQuery';
import { Config } from '../../util/config';
import * as i from 'io-ts'
import { UserNFTInfo } from 'custom-types/src/server/info';
import chalk from 'chalk';
import { IntFromString } from '../../lib/Parsers';

// user requests
// each user is uniquely identified by their Discord ID


const router = express.Router();


// /nft/user?id=<discordId>&offset=<offset>&limit=<limit>
// if start and end are specified, it returns all NFTs in the range (sorted by createdAt)
// else, default to 10 most recent NFTs

const UserIDQuery = i.partial({
    id: i.string,
    offset: IntFromString,
    pageSize: IntFromString,
})
router.get('/', parseQuery(UserIDQuery), async (req, res) => {
    console.log(`${chalk.green('[NFT]')} ${chalk.cyan('GET')} ${chalk.yellow('/user')}`)
    try {
        if (!req.query.id) {
            // send the default response if no userId is provided
            return res.send('NFT root')
        }

        const { id } = req.query

        const { supabase, tableName } = Config.getSupabaseClient()
        // retrieve the NFTs from the database

        const nfts = supabase
            .from(tableName)
            .select('id, createdAt, fullHash, ownedBy, type, msgLink, msgLinkValid, from')
            .eq('ownedBy', id)
            .order('createdAt', { ascending: false })

        if (req.query.offset) {
            const pageSize = req.query.pageSize || 5 // default to 5 max NFTs
            nfts.range(req.query.offset, req.query.offset + pageSize - 1)
        } else {
            nfts.range(0, 4);
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
            count: countData.length, // total number of NFTs owned by the user
            numReturned: nftData.length,
            nfts: nftData
        }
        console.log(`Returning NFTs: for user ${id}`, { count: returnVal.count, numReturned: returnVal.numReturned, nftsLength: returnVal.nfts.length })
        return res.status(200).json({ data: returnVal })

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});

export { router };