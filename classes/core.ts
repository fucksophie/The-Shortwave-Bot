import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

import dataset from "../dataset.json" assert { type: "json" }; 
import config from "../config.json" assert { type: "json" }; 

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
	const found = dataset.filter(item => { if(item.text.toLowerCase().includes(query.toLowerCase())) return item; })

	if(found.length == 0) {
		return "Couldn't find any results for that query!";
	} else {
		const text = "Found the following results:\n" + found.map(e => `${e.freq}: ${e.text.replaceAll("<br>", "\n")} ${e.mode ? "("+e.mode+")" : ""}`).join("\n");
		
		if(text.length > 2048) {
			return "Results were too large! Uploaded to paste.ee: " + await uploadToPaste(text);
		} else {
			return text;
		}
	}
}


export async function shortwaveInfo(freq: any): Promise<string> {

	if(isNaN(+freq)) {
		return "Invalid frequency!";
	}

	freq = Math.ceil(+freq);

	const result = await getShortwaveResult(freq);

	if(result.transmissions.length == 0) {
		return "Couldn't find anything for this frequency!";
	} else {
		const text = `Currently transmitting: ${result.currentTransmission.station} [${result.currentTransmission.language}] (${result.currentTransmission.freq})\n${result.transmissions.map(e => `${e.station} [${e.language}] (${e.freq})`).join("\n")}`;

		if(text.length > 2048) {
			return "Results were too large! Uploaded to paste.ee: " + await uploadToPaste(text);
		} else {
			return text;
		}
	}
}

async function getShortwaveResult(freq: string): Promise<ShortWaveResult> {
	const request = await fetch(`https://www.short-wave.info/index.php?freq=${freq}`);
	
	const text = await request.text();

	return ShortWaveResult.newResult(text);
}

class ShortWaveResult {
	currentTransmission!: Transmission;
	transmissions: Transmission[] = [];

	public static async newResult(body: string): Promise<ShortWaveResult> {
		const result = new ShortWaveResult();
		const document = new DOMParser().parseFromString(body, "text/html");
		
		if(!document)
			throw new Error("Missing HTMLDocument from parsed shortwave.info page!");

		if(document.querySelector("input[name=freq]")?.getAttribute("value") == '') return result;
	
		const table = document.querySelector("#output > tbody");
		const children = table?.children;

		if(!children)return result;
		

		[...table?.children].forEach(elem => {
			const chlds = [...elem.children];
			if(!chlds) return result;
			
			const transmission = new Transmission();
			
			transmission.freq = chlds[0].innerText.trim();
			transmission.station = chlds[1].innerText.trim();
			transmission.start = chlds[2].innerText.trim();
			transmission.end = chlds[3].innerText.trim();
			transmission.days = chlds[4].innerText.trim();
			transmission.language = chlds[5].innerText.trim();
			
			if(elem.classList.has("onair")) {
				result.currentTransmission = transmission;
			} else {
				result.transmissions.push(transmission);
			}
		})

		return result;
	}
}

class Transmission {
	freq!: string;
	station!: string;
	start!: string;
	end!: string;
	days!: string;
	language!: string;
	site!: string;
}