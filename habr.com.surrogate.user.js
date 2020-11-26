// ==UserScript==
// @name habr_com_spoiler_fix
// @description Replaced JS-based spoilers on habr.com with details/summary based ones
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://habr.com/*
// ==/UserScript==
"use strict";
let e = document.querySelectorAll("b.spoiler_title");
for (let a of e) {
	let d = a.parentElement,
	b = document.createElement("DETAILS"),
	c = document.createElement("SUMMARY");
	c.textContent = a.textContent;
	c.className = "spoiler_title";
	b.appendChild(c);
	for (let f of a.nextElementSibling.children)
		b.appendChild(f);
	b.className = a.nextElementSibling.className;
	d.parentElement.replaceChild(b, d)
};
