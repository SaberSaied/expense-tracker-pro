// Vercel serverless entry point.
//
// `npm run build` (the Vercel buildCommand) compiles src/ into dist/, so this
// thin wrapper imports the compiled Express app and exports it as the default
// handler. Vercel's @vercel/node builder serves this function for every path
// (see vercel.json routes) — no app.listen() here, Vercel handles the server.
import { createApp } from "../dist/app.js";

const app = createApp();

export default app;
