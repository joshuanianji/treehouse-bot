import express from 'express';
import { router } from './routes'
import cors from 'cors';

// Structure: https://kentcdodds.com/blog/how-i-structure-express-apps

// dotenv
import dotenv from 'dotenv';
import responseTime from 'response-time';
dotenv.config({ path: '.env.local' });


const app = express();
app.use(cors());
app.use(responseTime());
app.use(express.json());


app.use('/', router)

export { app }