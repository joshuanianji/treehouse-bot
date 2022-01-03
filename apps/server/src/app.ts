import express from 'express';
import { getRoutes } from './routes'
import cors from 'cors';

// Structure: https://kentcdodds.com/blog/how-i-structure-express-apps

// dotenv
import dotenv from 'dotenv';
import responseTime from 'response-time';
dotenv.config({ path: '.env.local' });


const app = express();
app.use(cors());
app.use(responseTime());


app.use('/', getRoutes())

export { app }