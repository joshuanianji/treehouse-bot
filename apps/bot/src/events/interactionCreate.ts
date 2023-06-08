import { Interaction } from "discord.js";
import { Event } from "../interfaces";

export const event: Event = {
    name: "interactionCreate",
    run: async (client, intr: Interaction) => {

        if (intr.isSelectMenu()) {
            const menu = client.selectMenus.get(intr.customId);
            if (menu) {
                menu.run(client, intr);
            }
        }
    }
};