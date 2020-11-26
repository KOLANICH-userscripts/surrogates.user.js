// ==UserScript==
// @name lazyload_surrogate
// @description Fixes a lot of websites using lazyload library.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @run-at document-idle
// @include *
// @resource lazyloadLib https://raw.githubusercontent.com/verlok/vanilla-lazyload/59a7a0e3f3b1a02cb63f096a8ead782dffe7bbd0/dist/lazyload.min.js
// @grant GM.getResourceUrl
// ==/UserScript==

"use strict";

let lazyDocs = document.querySelectorAll("img.lazy[data-src]");
if (lazyDocs.length) {
	console.info("The website contains images requiring `lazyload`.");
	GM.getResourceUrl("lazyloadLib").then(link => {
		alert(link);
		return fetch(link);
	}).then(r => r.text()).then(src => {
		alert(src);
		eval(src);
		let lazyLoadInstance = new LazyLoad({});
	});
}
