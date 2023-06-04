import { Event } from "../interfaces/index";
import chalk from "chalk";


export const event: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`${chalk.green("[INFO]")} ${client.user?.tag} is online!\n`);

        if (!client.application?.owner) await client.application?.fetch();

        if (client.application === null) {
            throw new Error("Client Did not register in time, please try again");
        }
    }
};
