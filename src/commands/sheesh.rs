// kinda weird
#[path = "../types/mod.rs"]
mod types;
#[path = "../util.rs"]
mod util;
use serenity::framework::standard::{macros::command, CommandResult};
use serenity::model::prelude::*;
use serenity::prelude::*;
use types::soundstore::SoundStore;

// NOT working right now

#[command]
#[only_in(guilds)]
pub async fn sheesh(ctx: &Context, msg: &Message) -> CommandResult {
    let guild = msg.guild(&ctx.cache).await.unwrap();
    let guild_id = guild.id;

    let channel_id = guild
        .voice_states
        .get(&msg.author.id)
        .and_then(|voice_state| voice_state.channel_id);

    let connect_to = match channel_id {
        Some(channel) => channel,
        None => {
            // user is not in a vc
            util::check_msg(msg.channel_id.say(&ctx.http, "SHEEEEEESH").await);
            return Ok(());
        }
    };

    let manager = songbird::get(ctx)
        .await
        .expect("Songbird Voice client placed in at initialisation.")
        .clone();
    let (handler_lock, success_reader) = manager.join(guild_id, connect_to).await;

    if let Ok(_reader) = success_reader {
        let mut handler = handler_lock.lock().await;
        util::check_msg(
            msg.channel_id
                .say(&ctx.http, &format!("Joined {}", connect_to.mention()))
                .await,
        );

        let sources_lock = ctx
            .data
            .read()
            .await
            .get::<SoundStore>()
            .cloned()
            .expect("Sound cache was installed at startup.");
        let sources = sources_lock.lock().await;
        let source = sources
            .get("sheesh")
            .expect("Handle placed into cache at startup.");

        let _song = handler.play_source(source.into());
    } else {
        util::check_msg(
            msg.channel_id
                .say(&ctx.http, "Error joining the channel")
                .await,
        );

        leave(ctx, msg).await?;
    }

    Ok(())
}

async fn leave(ctx: &Context, msg: &Message) -> CommandResult {
    let guild = msg.guild(&ctx.cache).await.unwrap();
    let guild_id = guild.id;

    let manager = songbird::get(ctx)
        .await
        .expect("Songbird Voice client placed in at initialisation.")
        .clone();
    let has_handler = manager.get(guild_id).is_some();

    if has_handler {
        if let Err(e) = manager.remove(guild_id).await {
            util::check_msg(
                msg.channel_id
                    .say(&ctx.http, format!("Failed: {:?}", e))
                    .await,
            );
        }

        util::check_msg(msg.channel_id.say(&ctx.http, "Left voice channel").await);
    } else {
        util::check_msg(msg.reply(ctx, "Not in a voice channel").await);
    }

    Ok(())
}
