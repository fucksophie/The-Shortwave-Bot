import { Bot } from "https://deno.land/x/telegram@v0.1.1/mod.ts";

import * as core from "../classes/core.ts";
import config from "../config.json" assert { type: "json" }; 
import { Implementation } from "../classes/Implementation.ts";

export default class Telegram extends Implementation {
	async start() {
		const telegram = new Bot(config.implementations.telegram.token);
		
		telegram.on("text", async (message) => {
			if(!message.message?.text) return;

			const args = message.message.text.split(" ");
			const command = args.shift();

			if(command == "/lookup") {
				await message.reply(await core.lookup(args.join(" ")))
			} else if(command == "/shortwave") {
				await message.reply(await core.shortwaveInfo(args[0]))
			}
		})

		await telegram.launch({});
		this.emit("ready");
	}
}