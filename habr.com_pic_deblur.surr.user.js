// ==UserScript==
// @name habr_com_pic_deblur
// @description Removes blur filter from images on habr.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://habr.com/*
// ==/UserScript==
"use strict";
[...document.querySelectorAll("[data-blurred]")].forEach(e => {
	delete e.dataset["blurred"]; // Fucking client-side blur!
});
