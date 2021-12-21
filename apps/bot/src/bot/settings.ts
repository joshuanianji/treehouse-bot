import { Settings } from './types/Settings';

const settings: Settings = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  BOT_OWNER_ID: [process.env.BOT_OWNER_ID || ''],
  PREFIX: '!'
}

export default settings;