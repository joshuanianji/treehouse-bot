import express from 'express'
import { Request, Response } from 'express';
import { getTrevRoutes } from './trevimg'
// any other routes imports would go here

const mainRoute = async (req: Request, res: Response) => {
  res.send('Server works!');
};

const getRoutes = () => {
  // create a router for all the routes of our app
  const router = express.Router()

  // any additional routes would go here
  router.get('/', mainRoute)
  router.use('/trev', getTrevRoutes())

  return router
}

export { getRoutes }