import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice } from "discordx";

@Discord()
export abstract class Ping {
    @Slash("ping")
    async choose(
        @SlashChoice("pingSlash", "pong")
        @SlashChoice("pongSlash", "ping")
        what: string,
        interaction: CommandInteraction
    ) {
        interaction.reply(what);
    }
}
