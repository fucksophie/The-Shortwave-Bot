import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import config from "../config.json" assert { type: "json" }; 

const dataset: Transmission[] = JSON.parse(Deno.readTextFileSync("dataset.json"));

async function uploadToPaste(text: string): Promise<string> {
	const request = await fetch("https://api.paste.ee/v1/pastes", {
		headers: {
			"Content-Type": "application/json",
			"X-Auth-Token": config.pasteee
		},
		method: "POST",
		body: JSON.stringify({
			"description":"radio bot paste",
			"sections": [ { "contents": text } ] 
		})
	});
	
	return (await request.json()).link;
}

export async function lookup(query: string): Promise<string> {
	const found = dataset.filter(item => {
		 if(item.station.toLowerCase().includes(query.toLowerCase())) return item; })

	if(found.length == 0) {
		return "Couldn't find any results for that query!";
	} else {
		const text = "Found the following results:\n" + found.map(e => `${e.khz}: ${e.station}`).join("\n");

		if(text.length > 2048) {
			return "Results were too large! Uploaded to paste.ee: " + await uploadToPaste(text);
		} else {
			return text;
		}
	}
}

export async function freqLookup(query: any): Promise<string> {
	if(isNaN(query)) {
		return "Please enter a number!";
	}
	
	query = Math.ceil(+query);

	const found = dataset.filter(item => {
		if(item.khz == query) return item; })

	if(found.length == 0) {
		return "Couldn't find any results for that query!";
	} else {
		const text = "Found the following results:\n" + found.map(e => `${e.khz}: ${e.station}`).join("\n");

		if(text.length > 2048) {
			return "Results were too large! Uploaded to paste.ee: " + await uploadToPaste(text);
		} else {
			return text;
		}
	}
}



class Transmission {
	khz!: number;
	time!: string;
	days!: string;
	itu!: string;
	station!: string;
	lng!: string;
	target!: string;
	remarks!: string;
	p!: string;
	start!: string;
	stop!: string;
}