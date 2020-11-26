// ==UserScript==
// @name dlc_kyoceradocumentsolutions_surrogate
// @description Allows to download Kyocera files without executing their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://dlc.kyoceradocumentsolutions.eu/index/service/*
// ==/UserScript==

"use strict";

let eulaLinkRx = /loadEula\('([^']+)'\);/;
let dlBase = "cdn.kyostatics.net";
let aEl = document.createElement("A");
aEl.href = dlBase;

for (let el of document.querySelectorAll("a[onclick]")) {
	let fn = el.textContent.trim();
	let eulaFunc = el.getAttribute("onclick").trim();
	let m = eulaLinkRx.exec(eulaFunc);
	if (m) {
		aEl.href = m[1];
		let pathComps = aEl.pathname.split("/");
		let lastComp = pathComps[pathComps.length - 1];
		lastComp = lastComp.split(".");
		let itemType = lastComp[1];
		itemType = itemType.split("-");
		itemType[itemType.length - 1] = "File";
		itemType = itemType.join("-");
		lastComp[1] = itemType;
		lastComp[lastComp.length - 1] = "tmp";
		lastComp = lastComp.join(".");
		pathComps[pathComps.length - 1] = lastComp;
		pathComps.push(fn);
		el.href = "";
		el.pathname = pathComps.join("/");
		el.host = dlBase;
		el.scheme = "https";
	}
} 
