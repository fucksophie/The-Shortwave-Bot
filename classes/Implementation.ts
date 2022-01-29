import EventEmitter from "https://deno.land/x/events@v1.0.0/mod.ts";

export abstract class Implementation extends EventEmitter {
	commands: Command[];
	name: string;

	constructor(name: string, commands: Command[]) {
		super();
		this.name = name;
		this.commands = commands;
	}
	
	async start() {}
}

class Command {
	name!: string;
	description!: string;
	function!: Function;
}
