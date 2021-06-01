use serenity;

/// Checks that a message successfully sent; if not, then logs why to stdout.
pub fn check_msg(result: serenity::Result<serenity::model::channel::Message>) {
    if let Err(why) = result {
        println!("Error sending message: {:?}", why);
    }
}
