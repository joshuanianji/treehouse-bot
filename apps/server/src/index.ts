import express from 'express';
import {getRoutes} from './routes'

// Structure: https://kentcdodds.com/blog/how-i-structure-express-apps

// dotenv
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PORT = parseInt(process.env.PORT) || 3001

const app = express();

app.use('/', getRoutes())

app.listen(PORT, () => {
  console.log(`Application started on port ${PORT}!`);
});
