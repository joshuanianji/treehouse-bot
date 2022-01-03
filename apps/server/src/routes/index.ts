import express from 'express'
import { Request, Response } from 'express';
import * as trev from './trevimg'
import * as testSupabase from './test-supabase'
// any other routes imports would go here

const mainRoute = async (req: Request, res: Response) => {
  res.status(200).send('Server works!');
};

const getRoutes = () => {
  // create a router for all the routes of our app
  const router = express.Router()

  // any additional routes would go here
  router.get('/', mainRoute)
  router.use('/trev', trev.getRoutes())
  router.use('/supabase', testSupabase.getRoutes())

  return router
}

export { getRoutes }