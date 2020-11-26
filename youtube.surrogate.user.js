// ==UserScript==
// @name youtube_surrogate
// @description Allows to watch YouTube without YouTube-supplied JavaScript
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://www.youtube.com/watch?v=*
// ==/UserScript==

"use strict";

let userPrefs = {
	"maximize": { // Choose the video with the max X disrespect to anything else
		"fps": false,
		"resolution": false,
		"bitRate": false,
		"audio": {
			"quality": false,
			"channels": false,
			"sampleRate": false,
		},
		"codec": "", // Prefer this codec
	},
	"minimizeBandwidth": true, // Choose the video with the minimum size
	"allowSubScreen": false, // Allow videos smaller than screen resolution if the ones larger than it available
}

function parseMetadata() {
	let rx = /(?:var|let)\s*ytInitialPlayerResponse\s*=\s*(\{.+?\})[;\n]+(?:var|let)\s*\w+/;
	for (let el of document.getElementsByTagName("script")) {
		el = el.textContent;
		if (el.indexOf("streamingData") == -1)
			continue;

		let m = rx.exec(el);
		if (m) {
			return JSON.parse(m[1]);
		}
	}
}

let md = parseMetadata();

document.body.innerHTML = "";

let vd = md["videoDetails"];
let header = document.createElement("H1");
header.textContent = vd["title"] + "( " + md["videoId"] + " )";
document.body.appendChild(header);

let author = document.createElement("span");
author.textContent = vd["author"];
document.body.appendChild(author);

if (vd["shortDescription"]) {
	let descr = document.createElement("section");
	descr.textContent = vd["shortDescription"];
	document.body.appendChild(descr);
}

if (vd["keywords"]) {
	let kwContainer = document.createElement("span");
	kwContainer.textContent = vd["keywords"].join(",");
	document.body.appendChild(kwContainer);
}

let rating = document.createElement("span");
rating.textContent = vd["averageRating"];
document.body.appendChild(rating);

let views = document.createElement("span");
views.textContent = vd["viewCount"];
document.body.appendChild(views);

function getScreenDescriptor(width = null, height = null) {
	if (width === null) {
		width = document.documentElement.clientWidth;
	}
	if (height === null) {
		height = document.documentElement.clientHeight;
	}
	return {
		"width": width,
		"height": height,
		"area": width * height,
		"aspect": width / height,
	};
}

function harmMean(...els) {
	let acc = 0;
	for (let el of els) {
		acc += 1 / el;
	}
	return els.length / acc;
}

function kvListOpt(init, compar, kvPairs, arg = false) {
	let optK = init,
	optV = init;
	for (let[k, v]of kvPairs) {
		if (compar(v, optV)) {
			optK = k;
			optV = v;
		}
	}
	if (arg)
		return optK;
	else
		return optV;
}

function kvListMax(kvPairs, arg = false) {
	return kvListOpt(Number.NEGATIVE_INFINITY, (a, b) => a > b, kvPairs, arg);
}

function kvListMin(kvPairs, arg = false) {
	return kvListOpt(Number.POSITIVE_INFINITY, (a, b) => a < b, kvPairs, arg);
}

function selectContent(content, deviceDescriptor) {
	for (let tbD of content) {
		let w = tbD["width"];
		let h = tbD["height"];
		tbD["pixels"] = w * h;
		tbD["aspect"] = w / h;
		let discrep = {};
		for (let k in tbD) {
			if (deviceDescriptor[k]) {
				let d = tbD[k] - deviceDescriptor[k];
				let ad = Math.abs(d);
				discrep[k] = harmMean(ad / deviceDescriptor[k], ad / tbD[k]);
			}
		}
		tbD["discrep"] = discrep;
		tbD["maxDiscrep"] = kvListMax(Object.entries(discrep));
	}
	return content[kvListMin([...content.entries()].map(([k, v]) => [k, v["maxDiscrep"]]), true)];
}

let sD = getScreenDescriptor();
let tbs = selectContent(vd["thumbnail"]["thumbnails"], sD)["url"];

function getFormats(md) {
	let sd = md["streamingData"];

	let af = sd["adaptiveFormats"].filter(f => f["width"] && f["height"]);
	af.forEach(f => {
		f["adaptive"] = true;
	});

	let formats = sd["formats"];
	formats.forEach(f => {
		f["adaptive"] = false;
	});

	return formats.concat(af);
}
let formats = getFormats(md);

function filterFormatsByResolution(formats, resolutionPrototype) {
	return formats.filter(
		f => {
		return f.width >= resolutionPrototype.width && f.height >= resolutionPrototype.height;
	})
}

function prefilterFormats(formats, sD, userPrefs) {
	let formatMatchingTheScreenBest = selectContent(formats, sD);
	let formatsNoWorseThanThePrototype = filterFormatsByResolution(formats, formatMatchingTheScreenBest);

	if (userPrefs["allowSubScreen"]) {
		return formatsNoWorseThanThePrototype;
	}
	let formatsNoWorseThanScreen = filterFormatsByResolution(formatsNoWorseThanThePrototype, sD);
	if (!formatsNoWorseThanScreen.length) {
		return formatsNoWorseThanThePrototype;
	}
	return formatsNoWorseThanScreen;
}

formats = prefilterFormats(formats, sD, userPrefs);

let a = document.createElement("A");
a.href = formats[0]["url"];
a.textContent = "Direct link";
a.type = formats[0]["mimeType"];
document.body.appendChild(a);

let vt = document.createElement("VIDEO");
for (let f of formats) {
	let fe = document.createElement("SOURCE");
	fe.src = f.url;
	fe.type = f.mimeType;
	vt.appendChild(fe);
}
vt.width = vt.style.width = "100%";
vt.height = vt.style.height = "100%";
vt.poster = tbs;
vt.controls = true;
document.body.appendChild(vt);
