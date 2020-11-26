// ==UserScript==
// @name bing_nojs_surrogate
// @description Allows to use Bing without M$-shipped JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://www.bing.com/search?*
// ==/UserScript==


"use strict";
function getMSAlreadyKnownTS() {
	let a = (new Date).getTime();
	let b = Math.floor(a / 10000000);
	return 1000 * parseInt(document.documentElement.innerHTML.match(new RegExp(b + "\\d+"))[0]);
}
function parseCookies() {
	let a = document.cookie.split(";");
	let b = new Map;
	for (let c of a) {
		a = c.indexOf("="),
		b.set(c.slice(0, a).trim(), c.slice(a + 1).trim());
	}
	return b;
}
function parseSingleCookie(a) {
	let b = a.split("&");
	a = new Map;
	for (let c of b) {
		b = c.indexOf("="),
		a.set(c.slice(0, b).trim(), c.slice(b + 1).trim());
	}
	return a;
}
(function () {
	let a = parseCookies();
	if (!a.has("SRCHHPGUSR")) {
		console.info("Necro$oft, allowing search only to the users with JS enabled is not nice! 🖕");
		let d = getMSAlreadyKnownTS();
		let b = Math.round(d / 1000),
		c = new Uint8Array(11);
		window.crypto.getRandomValues(c);
		c = [...c].map(h => (h % 10).toString()).join("");
		b = "SRCHHPGUSR=HV=" + b + "&WTS=" + c;
		document.cookie = b;
		a.has("SRCHUSR") && (c = a.get("SRCHUSR"), parseSingleCookie(c).has("T") || (c = "SRCHUSR=" + c + "&T=" + d + ";", console.log(c), console.log(b), document.cookie = c));
		a.has("ipv6") || (document.cookie = ";ipv6=hit=" + d);
		window.location.reload();
	}
})();
