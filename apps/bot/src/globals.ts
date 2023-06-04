/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/member-ordering */
import { Collection } from "discord.js";
import Config from "./config";

export const CONFIG = Config.getConfig();

export const commands = new Collection;
