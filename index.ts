import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
config();
const ctx: Context = new Context();

["Command", "Event"].forEach(async (x) => {
  await require(`./Handlers/${x}`).default(ctx);
});

SetupMongo({ uri: process.env.MONGODB });

ctx.login(process.env.TOKEN);
