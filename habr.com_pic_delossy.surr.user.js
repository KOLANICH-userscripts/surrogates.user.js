// ==UserScript==
// @name habr_com_pic_delossy
// @description Replaces versions of pics compressed with extreme parameters with less spoiled ones on habr.com.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://habr.com/*
// ==/UserScript==
"use strict";
[...document.querySelectorAll("img[data-src]")].forEach(e => {
	e.src = "";
	e.src = e.dataset["src"];
})
