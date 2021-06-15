use std::env;

use serenity::model::prelude::*;
use serenity::prelude::*;
use serenity::{
    async_trait,
    model::{channel::Message, gateway::Ready},
};
mod util;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    // Set a handler for the `message` event - so that whenever a new message
    // is received - the closure (or function) passed will be called.
    //
    // Event handlers are dispatched through a threadpool, and so multiple
    // events can be dispatched simultaneously.
    async fn message(&self, ctx: Context, msg: Message) {
        // this is a simple way to make sure it doesn't react to our messages
        if !msg.author.bot {
            let guild: Guild = msg.guild(&ctx.cache).await.unwrap();

            let emote_res = among_ass_emoji(&guild, &ctx).await;
            if let Some(among_ass_id) = emote_res {
                let reaction_res = msg.react(ctx, among_ass_id).await;
                match reaction_res {
                    Ok(_) => println!("Successfully reacted!"),
                    Err(e) => println!("Error reacting! {:?}", e),
                }
            }
        }
    }

    // Set a handler to be called on the `ready` event. This is called when a
    // shard is booted, and a READY payload is sent by Discord. This payload
    // contains data like the current user's guild Ids, current user data,
    // private channels, and more.
    //
    // In this case, just print what the current user's username is.
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() {
    // This will load the environment variables located at `./.env`, relative to
    // the CWD. See `./.env.example` for an example on how to structure this.
    dotenv::dotenv().expect("Failed to load .env file");
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    // Create a new instance of the Client, logging in as a bot. This will
    // automatically prepend your bot token with "Bot ", which is a requirement
    // by Discord for bot users.
    let mut client = Client::builder(&token)
        .event_handler(Handler)
        .await
        .expect("Err creating client");

    // Finally, start a single shard, and start listening to events.
    //
    // Shards will automatically attempt to reconnect, and will perform
    // exponential backoff until it reconnects.
    if let Err(why) = client.start().await {
        println!("Client error: {:?}", why);
    }
}

async fn among_ass_emoji(guild: &Guild, ctx: &Context) -> Option<Emoji> {
    let guild_id = guild.id.as_u64();
    match guild_id {
        678315948230574101 => {
            // ahmad's server
            println!("Reacting to msg in Ahmad's server");
            let emoji = guild.emoji(ctx, EmojiId(852774137565937725)).await;
            return emoji.ok();
        }
        772710190553628682 => {
            // testing server
            println!("Reacting to msg in the Bot server");
            let emoji = guild.emoji(ctx, EmojiId(854225028609605642)).await;
            return emoji.ok();
        }
        445432481873657858 => {
            println!("Reacting to msg in the Treehouse");
            let emoji = guild.emoji(ctx, EmojiId(854237648440918066)).await;
            return emoji.ok();
        }
        _ => {
            println!("Alternate server - no amongass for them");
            return None;
        }
    }
}
