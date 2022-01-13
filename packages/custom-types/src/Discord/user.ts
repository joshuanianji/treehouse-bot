// Discord's User type
// https://discord.com/developers/docs/resources/user#user-object
// at least, the ones we care about

import * as i from 'io-ts';
import { sparseType, optional } from 'io-ts-extra';

export const DiscordUser = sparseType({
    id: i.string,
    username: i.string,
    discriminator: i.string,
    avatar: i.string,
    accent_color: optional(i.number), // integer representation of hex code (might be null)
})

export type DiscordUser = i.TypeOf<typeof DiscordUser>;
