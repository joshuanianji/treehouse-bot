import express, { Request, Response } from 'express';
import * as supabase from './supabase';
import * as trev from './trev';
import * as user from './user';
import * as nft from './nft';


// create a router for all the routes of our app
const router = express.Router()

// any additional routes would go here
router.get('/', async (req: Request, res: Response) => {
    res.status(200).send('Server works!');
});
router.use('/supabase', supabase.router);
router.use('/trev', trev.router);
router.use('/user', user.router);
router.use('/nft', nft.router);


export { router }