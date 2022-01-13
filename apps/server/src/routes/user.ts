// basically a proxy of Discord's REST API

import chalk from 'chalk';
import axios from 'axios';
import * as i from 'io-ts';
import express from 'express';
import { fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { Config } from './../util/config';
import { DiscordUser } from 'custom-types';
import { parseQuery } from './../middleware/parseQuery';
import { formatValidationErrors } from 'io-ts-reporters';

const router = express.Router()

// GET /user?id=<userId>
const UserIDQuery = i.type({
    id: i.string,
})
router.get('/', parseQuery(UserIDQuery), async (req, res) => {
    console.log(`${chalk.green('[USER]')} ${chalk.cyan('GET')} ${chalk.yellow('/')}`)
    const { id } = req.query;

    try {
        const token = Config.getDiscordToken();

        // https://discord.com/developers/docs/resources/user#get-user
        const data = await axios.get('https://discordapp.com/api/users/' + id, {
            headers: { Authorization: `Bot ${token}`, },
        });

        return pipe(
            DiscordUser.decode(data.data),
            fold(
                (err) => {
                    console.log('Error parsing DiscordUser', formatValidationErrors(err));
                    return res.status(500).send({
                        code: 'PARSING_ERROR',
                        title: 'Error parsing DiscordUser',
                        message: formatValidationErrors(err)
                    })
                },
                (user) => {
                    console.log('Successfully parsed DiscordUser', user.id);
                    return res.status(200).send({ data: user });
                }
            )
        )
    } catch (e) {
        console.log(`Error retrieving user with ID ${id}!`, e)
        return res.status(500).send({
            code: 'UNKNOWN_ERROR',
            title: `Unknown Error retrieving user with ID ${id}!`,
            message: e.message,
            details: e
        })
    }
})

export { router }