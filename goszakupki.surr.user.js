// ==UserScript==
// @name goszakupki_view_surrogate
// @description Allows you to view Russian government procurement portal without their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://zakupki.gov.ru/*
// ==/UserScript==

"use strict";
document.body.style.overflowX="auto";
document.body.style.opacity=1;

for(let el of document.querySelectorAll("[url]")){
	let a = document.createElement("A");
	a.href=el.getAttribute("url");
	let spn = el.getElementsByTagName("SPAN")[0];
	a.innerHTML=spn.innerHTML;
	a.className=spn.className;
	spn.replaceWith(a);
}