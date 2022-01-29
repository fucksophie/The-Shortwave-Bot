import { createBot, startBot, DiscordenoMessage } from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
import { enableCachePlugin, enableCacheSweepers } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";

import * as core from "../classes/core.ts";
import config from "../config.json" assert { type: "json" }; 
import { Implementation } from "../classes/Implementation.ts";

export default class Discord extends Implementation {
	async start() {
		const fart = this;

		const baseDiscord = createBot({
			token: config.implementations.discord.token,
			intents: ["Guilds", "GuildMessages"],
			botId: BigInt(config.implementations.discord.botID),
			events: {
				ready() {
					fart.emit("ready");
				},
				messageCreate: async (bot: any, message: DiscordenoMessage) => {
					const args = message.content.split(" ");
					const command = args.shift();
					
					this.commands.forEach(async comand => {
						if(command == "??"+comand.name) {
							try {
								await bot.helpers.sendMessage(message.channelId, {
									content: await core.lookup(args.join(" "))
								});
							} catch(e) {
								console.log('Failed sending message.');
							}
						}
					});
				},
			},
		});

		const discord = enableCachePlugin(baseDiscord);

		enableCacheSweepers(discord);

		await startBot(discord);
	}
}

