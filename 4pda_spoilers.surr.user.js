// ==UserScript==
// @name 4pda_spoilers_surrogate
// @description Replaces 4PDA JS-based spoilers with details/summary
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://4pda.to/forum/*
// @match https://4pda.ru/forum/*
// ==/UserScript==

'use strict';
let forceOpen = false;

for (let sp of document.getElementsByClassName("post-block spoil")) {
	let t = sp.getElementsByClassName("block-title")[0], b = sp.getElementsByClassName("block-body")[0];
	let d = document.createElement("DETAILS");
	d.innerHTML = b.innerHTML;
	d.className = sp.className;
	d.open = !sp.className.indexOf("close") || forceOpen;
	let s = document.createElement("SUMMARY");
	d.insertBefore(s, d.children[0]);
	s.className = t.className;
	s.innerHTML = t.innerHTML;
	sp.parentElement.replaceChild(d, sp);
};
