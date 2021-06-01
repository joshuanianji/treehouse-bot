mod commands;
mod types;

use serenity::{
    async_trait,
    client::bridge::gateway::ShardManager,
    framework::{standard::macros::group, StandardFramework},
    model::{event::ResumedEvent, gateway::Ready},
    prelude::*,
};
use std::{env, sync::Arc};

use tracing::info;
use tracing_subscriber;

use commands::sheesh::*;
use std::collections::HashMap;
use types::soundstore::{CachedSound, SoundStore};

pub struct ShardManagerContainer;

impl TypeMapKey for ShardManagerContainer {
    type Value = Arc<Mutex<ShardManager>>;
}
use songbird::{
    input::{self, cached::Compressed},
    Bitrate, SerenityInit,
};

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }

    async fn resume(&self, _: Context, _: ResumedEvent) {
        info!("Resumed");
    }
}

#[group]
#[commands(sheesh)]
struct General;

#[tokio::main]
async fn main() {
    // This will load the environment variables located at `./.env`, relative to
    // the CWD. See `./.env.example` for an example on how to structure this.
    dotenv::dotenv().expect("Failed to load .env file");
    // initialize logger? idk
    tracing_subscriber::fmt::init();

    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    // Create the framework
    let framework = StandardFramework::new()
        .configure(|c| c.prefix("!"))
        .group(&GENERAL_GROUP);

    let mut client = Client::builder(&token)
        .event_handler(Handler)
        .framework(framework)
        .register_songbird()
        .await
        .expect("Err creating client");

    {
        let mut data = client.data.write().await;

        // Loading the audio ahead of time. This makes the music accessible to all commands
        // technically only the sheesh command needs it, but who knows in the future?
        // based off of songbird's example of loading music
        // https://github.com/serenity-rs/songbird/blob/current/examples/serenity/voice_storage/src/main.rs#L104-L146
        let mut audio_map = HashMap::new();

        let sheesh_src = Compressed::new(
            input::ffmpeg("sheesh.mp3")
                .await
                .expect("Link may be dead."),
            Bitrate::BitsPerSecond(128_000),
        )
        .expect("These parameters are well-defined.");
        let _ = sheesh_src.raw.spawn_loader();
        audio_map.insert("sheesh".into(), CachedSound::Compressed(sheesh_src));
        data.insert::<SoundStore>(Arc::new(Mutex::new(audio_map)));
    }

    let _ = client
        .start()
        .await
        .map_err(|why| println!("Client ended: {:?}", why));
}
