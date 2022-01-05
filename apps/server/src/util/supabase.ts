import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { load } from 'js-yaml'
import fs from 'fs'

interface Config {
    supabase: {
        url: string
        jwt_secret: string
        api_key: string,
        table: string
    },
    dev: boolean
}

class Config implements Config {
    // the bot-config.yml should exist in the same directory as docker-compose.yml
    private static readonly _configLocation = "./../../server-config.yml";

    public static getConfig = (): Config => {
        // when running in Docker, we have the CONFIG_PATH being /run/secrets/server-config.yml
        const configLocation = process.env.CONFIG_PATH || Config._configLocation
        console.log(`Reading config from ${configLocation}`);

        try {
            const fileContents = fs.readFileSync(
                configLocation,
                "utf-8"
            );
            const casted = load(fileContents) as Config;

            return casted;

        } catch (e) {
            console.log(e)
            throw new Error("Error getting config (.yml file is probably not there). Trying to read from: " + configLocation);
        }
    }

    public static getSupabaseClient = (): { supabase: SupabaseClient, tableName: string } => {
        const { supabase: config } = Config.getConfig();

        return { supabase: createClient(config.url, config.api_key), tableName: config.table };
    }

    public static tableName = (): string => {
        const { supabase } = Config.getConfig();
        return supabase.table;
    }
}

export { Config }