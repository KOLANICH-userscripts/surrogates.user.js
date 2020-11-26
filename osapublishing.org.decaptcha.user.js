// ==UserScript==
// @name osapublishing_decaptcha
// @description Automatically solves the captcha for OSAPublishing
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://www.osapublishing.org/captcha/*
// ==/UserScript==

"use strict";

var remaps = [
	// depend each time from the generated font. Need to apply contour analysis.
];

function* range(start, stop) {
	for (let i = 0; i <= stop; ++i) {
		yield i;
	}
}

function remapChar(cp) {
	let c;
	for (let r of remaps) {
		let [crange, replacement] = r;
		if (crange instanceof Array) {
			let l = crange[0].codePointAt(0);
			let r = crange[1].codePointAt(0);
			if (l <= cp && cp <= r) {
				c = String.fromCodePoint(replacement.codePointAt(cp - l));
				break;
			}
		} else {
			if (c == crange.codePointAt(0)) {
				c = replacement;
				break;
			}
		}
	}
	return c;
}

function remapStr(s) {
	let res = [];
	for (let c of s) {
		let r = remapChar(c.codePointAt(0));
		if(typeof r == "undefined"){
			r = c;
		}
		res.push(r);
	}
	return res.join("");
}

var p = document.getElementsByClassName("puzzle")[0];
document.getElementById("Answer").value = remapStr(p.textContent);
