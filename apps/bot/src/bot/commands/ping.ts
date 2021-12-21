import Command from '../struct/Command';
import { Message } from 'discord.js';

abstract class PingCommand extends Command {
  constructor() {
    super({
      name: 'ping',
      aliases: ['p'],
      description: 'Pong!',
    });
  }

  exec(message: Message) {
    console.log('[MESSAGE]', message.content);
    return message.reply('Pong!');
  }
}

export default PingCommand;