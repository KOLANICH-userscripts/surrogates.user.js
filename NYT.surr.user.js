// ==UserScript==
// @name NYT_surrogate
// @description Allows you to see images in NYT without their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include hthttps://www.nytimes.com/*
// ==/UserScript==

"use strict";

[...document.querySelectorAll("img[data-src]")].forEach(e => {e.src = e.dataset["src"]; delete e.dataset["src"];});
