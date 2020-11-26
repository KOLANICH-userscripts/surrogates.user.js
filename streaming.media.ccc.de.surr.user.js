// ==UserScript==
// @name streaming.media.ccc.de_surrogate
// @description CCC streaming platform surrogate
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://streaming.media.ccc.de/rc3/*
// ==/UserScript==

"use strict";
let dgecn = document.getElementsByClassName.bind(document);

let tabsHeaders = dgecn("nav nav-functions nav-tabs nav-justified")[0].getElementsByTagName("A"),
	tabs = dgecn("functions-wrap tab-content")[0].getElementsByClassName("tab-pane"),
	tabz = new Map;
for (let el of tabs) {
	tabz.set(el.id, el);
}
for (let el of tabsHeaders) {
	el.classList.remove("active");
	el.addEventListener("click", e => {
		let t = tabz.get(e.target.hash.substring(1));
		for (let t of tabs) {
			t.classList.remove("active");
		}
		t.classList.add("active");
		e.preventDefault();
		e.stopPropagation();
	}, !1);
}
