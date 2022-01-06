import { slashCommand as roleSlashCommand } from './roles';
import { slashCommand as rateSlashCommand } from './rate';
import { slashCommand as saySlashCommand } from './say';

const slashCommands = [roleSlashCommand, rateSlashCommand, saySlashCommand];
export default slashCommands;
