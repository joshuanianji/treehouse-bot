import express from 'express'
import { Request, Response } from 'express';
import * as trev from './trev'
import * as testSupabase from './test-supabase'
import * as nft from './nft'


// create a router for all the routes of our app
const router = express.Router()

// any additional routes would go here
router.get('/', async (req: Request, res: Response) => {
  res.status(200).send('Server works!');
});
router.use('/trev', trev.router)
router.use('/supabase', testSupabase.router)
router.use('/nft', nft.router)


export { router }