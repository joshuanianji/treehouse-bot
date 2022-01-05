import express from 'express'
import { Request, Response, } from 'express';
import { parseBody } from './../../middleware/parseBody';
import { Config } from './../../util/supabase';
import * as i from 'io-ts'
import { NFT } from 'custom-types';

// any other routes imports would go here


const router = express.Router()


router.get('/', async (req, res) => {
    try {
        res.send('NFT root')
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
            console.log('Error uploading NFT: ', error)
            return res.status(500).json({
                title: 'Error uploading NFT!',
                error: JSON.stringify(error)
            })
        }

        console.log('NFT upload success! ', data)
        res.status(200).json({
            title: 'NFT upload success!',
            data: data
        })

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

export { router }
