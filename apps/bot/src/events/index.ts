// list of all the files in /events

import { event as interactionCreateEvent } from './interactionCreate';
import { event as messageEvent } from './message';
import { event as readyEvent } from './ready'

const events = [interactionCreateEvent, messageEvent, readyEvent];
export default events;
