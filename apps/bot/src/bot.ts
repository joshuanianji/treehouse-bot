import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Client from './bot/client/Client';
const client: Client = new Client();
client.start();
