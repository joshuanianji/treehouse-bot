import express from 'express'
import { Request, Response, } from 'express';
import { parseBody } from './../../middleware/parseBody';
import { Config } from './../../util/supabase';
import * as i from 'io-ts'
import { NFT } from 'custom-types';

// any other routes imports would go here


const router = express.Router()

router.get('/', parseBody(NFT), async (req, res) => {
    try {
        res.send('NFT root')
    } catch (error) {
        console.log(error)
        res.send(error)
    }
});

export { router }
