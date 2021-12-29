import { Command } from "../../interfaces";
import axios from 'axios'
import { MessageEmbed } from "discord.js";

export const command: Command = {
    // Note aliases are optional
    aliases: ["p"],
    description: "Omega Test!",
    example: ["!ping"],
    group: "other",
    name: "ping",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, _args) => {
        // Run your code here
        try {
            await msg.channel.sendTyping();
            await msg.channel.send('Pinging server...')

            const res = await axios.get(`${process.env.SERVER_HOST}`)
            const data = res.data;
            return msg.channel.send('Got response:' + JSON.stringify(data));
        } catch (e) {
            console.error(e);
            const embed = new MessageEmbed()
                .setTitle('Something went wrong!')
                .addField('Error', JSON.stringify(e), false)
            return msg.channel.send({ embeds: [embed] });
        }
    }
};
