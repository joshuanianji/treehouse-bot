use serenity::prelude::*; // TypeMapKey, Mutex
use songbird::input::{
    cached::{Compressed, Memory},
    Input,
};
use std::{collections::HashMap, convert::TryInto, sync::Arc};

pub enum CachedSound {
    Compressed(Compressed),
    Uncompressed(Memory),
}

impl From<&CachedSound> for Input {
    fn from(obj: &CachedSound) -> Self {
        match obj {
            CachedSound::Compressed(c) => c.new_handle().into(),
            CachedSound::Uncompressed(u) => {
                return u
                    .new_handle()
                    .try_into()
                    .expect("Failed to create decoder for Memory source.");
            }
        }
    }
}

pub struct SoundStore;

impl TypeMapKey for SoundStore {
    type Value = Arc<Mutex<HashMap<String, CachedSound>>>;
}
