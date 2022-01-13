
// Error types

// an error that needs a Context, generating an async value
// used in Discord.js
export type ErrorWithContext<Ctx> = (ctx: Ctx) => Promise<string>
