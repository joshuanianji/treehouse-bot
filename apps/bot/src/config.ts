import { dump, load } from "js-yaml";
import { CONFIG } from "./globals";
import fs from "fs";

export interface DevEnv {
    devServer: string;
    isDev: boolean;
}

/**
 * This represents the config.yml
 * @class Config
 * @property {string} token
 * @property {string} prefix
 * @property {string[]} owners
 */
export default class Config {
    // the bot-config.yml should exist in the same directory as docker-compose.yml
    private static readonly _configLocation = "./../../bot-config.yml";

    public readonly devEnv: DevEnv;

    public readonly owners: string[];

    public readonly prefix: string;

    public readonly token: string;

    private constructor() {
        this.devEnv = { devServer: "", isDev: false };
        this.owners = [""];
        this.prefix = "";
        this.token = "";
    }

    /**
     * Call getConfig instead of constructor
     * 
     * Read from environment variables.
     */
    public static getConfig(): Config {
        // when running in Docker, we have the CONFIG_PATH being /run/secrets/bot-config.yml
        const configLocation = process.env.CONFIG_PATH || Config._configLocation
        console.log(`Reading config from ${configLocation}`);

        if (!fs.existsSync(configLocation)) {
            throw new Error("Please create a config.yml. Config Location: " + configLocation);
        }
        const fileContents = fs.readFileSync(
            configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as Config;

        console.log('Development: ', casted.devEnv.isDev)

        return casted;
    }

    /**
   *  Safe the config to the congfig.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(Config._configLocation, dump(CONFIG));
    }
}
