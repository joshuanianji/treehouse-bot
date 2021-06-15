// kinda weird
#[path = "../types/mod.rs"]
mod types;
#[path = "../util.rs"]
mod util;
use serenity::framework::standard::{macros::command, CommandResult};
use serenity::model::prelude::*;
use serenity::prelude::*;

#[command]
#[only_in(guilds)]
pub async fn amongass(ctx: &Context, msg: &Message) -> CommandResult {
    let guild: Guild = msg.guild(&ctx.cache).await.unwrap();
    println!("{:?}", guild.emojis);

    let emote_res = among_ass_emoji(&guild, ctx, msg).await;
    if let Some(among_ass_id) = emote_res {
        let reaction_res = msg.react(ctx, among_ass_id).await;
        match reaction_res {
            Ok(_) => println!("Successfully reacted!"),
            Err(e) => println!("Error reacting! {:?}", e),
        }
    }

    Ok(())
}

async fn among_ass_emoji(guild: &Guild, ctx: &Context, msg: &Message) -> Option<Emoji> {
    let guild_id = guild.id.as_u64();
    match guild_id {
        678315948230574101 => {
            // ahmad's server
            util::check_msg(msg.channel_id.say(&ctx.http, "Ahmad's server").await);
            // return Some(EmojiId(852774137565937725));
            return None;
        }
        772710190553628682 => {
            // testing server
            util::check_msg(msg.channel_id.say(&ctx.http, "Bot server").await);
            let emoji = guild.emoji(ctx, EmojiId(854225028609605642)).await;
            match emoji {
                Ok(e) => return Some(e),
                Err(err) => {
                    println!("Error reacting! {:?}", err);
                    return None;
                }
            }
        }
        _ => {
            util::check_msg(msg.channel_id.say(&ctx.http, "alternate server").await);
            return None;
        }
    }
}
