

import * as core from "./classes/core.ts"
import { Implementation } from "./classes/Implementation.ts";

const commands = [
	{
		name: "lookup",
		description: "Find freqs related to a keyword",
		function: core.lookup
	},
	{
		name: "shortwave",
		description: "Find what station is transmitting to a freq",
		function: core.shortwaveInfo
	}
];

[...Deno.readDirSync("./implementations")].map(e => e.name).forEach(async y => {
	const elem = await import("./implementations/"+y);

	const impl: Implementation = new elem.default(elem.default.name, commands);

	impl.on("ready", () => {
		console.log(`[${impl.name}] is ready!`);
	})

	impl.start();
})