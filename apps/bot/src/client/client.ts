/* eslint-disable @typescript-eslint/member-ordering */
import { Client, Collection, CommandInteraction, Message } from 'discord.js';
import { Command, Event } from '../interfaces/index';
import { CONFIG } from '../globals';
import { Cooldowns } from '../interfaces/cooldown';
import SelectMenus from '../interfaces/selectMenus';
import commands from '../commands';
import events from '../events';

class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public cooldowns: Collection<string, Cooldowns> = new Collection();
    public selectMenus: Collection<string, SelectMenus> = new Collection();

    public async init(): Promise<void> {
        await this.login(CONFIG.token);

        /* Commands */
        commands.forEach(cmd => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            this.commands.set(cmd.name, cmd);

            if (cmd?.aliases !== undefined) {
                cmd.aliases.forEach((alias: string) => {
                    this.aliases.set(alias, cmd);
                });
            }
        });

        /* Events */
        events.forEach(event => {
            this.events.set(event.name, event);
            console.log(event);
            this.on(event.name, event.run.bind(null, this));
        });
    }

    public async commandFailed(msg: Message | CommandInteraction): Promise<void | Message> {
        if (msg instanceof Message) {
            return msg.reply({ content: "There was an error when executing the command" });

        }
        return msg.reply({ content: "There was an error when executing the command", ephemeral: true });
    }
}

export default ExtendedClient;


