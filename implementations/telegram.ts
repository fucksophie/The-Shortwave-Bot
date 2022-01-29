import { Bot } from "https://deno.land/x/telegram@v0.1.1/mod.ts";

import config from "../config.json" assert { type: "json" }; 
import { Implementation } from "../classes/Implementation.ts";

export default class Telegram extends Implementation {
	async start() {
		const telegram = new Bot(config.implementations.telegram.token);
		
		telegram.on("text", async (message) => {
			if(!message.message?.text) return;

			const args = message.message.text.split(" ");
			const command = args.shift();

			this.commands.forEach(async comand => {
				if(command == "/"+comand.name) {
					try {
						await message.reply(await comand.function(args.join(" ")));
					} catch(e) {
						console.log('Failed sending message.');
					}
				}
			});
		})

		await telegram.launch({});
		this.emit("ready");
	}
}