import { Command } from '../../interfaces';
import { TrevResponse } from 'custom-types'
import axios from 'axios';

export const command: Command = {
    // Note aliases are optional
    description: "Makes trevor say something",
    example: ["!trevsay Hello World!"],
    group: "other",
    name: "trevsay",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const text = args.join(' ');
        const res = await axios.get<TrevResponse>(`http://localhost:3001/trev?text=${encodeURI(text)}`)
        const data = res.data;

        console.log('Got image, dimensions are:', data.width, data.height);

        // convert data to bugger
        const b64image = data.data.split(',')[1];
        const buf = Buffer.from(b64image, 'base64');

        return msg.channel.send({
            content: 'hi',
            files: [buf]
        })
    }
};
