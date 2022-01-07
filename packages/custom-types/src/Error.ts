
// Error types

// an error that needs a Context, generating an async value
export type ErrorWithContext<Ctx> = (ctx: Ctx) => Promise<string>
