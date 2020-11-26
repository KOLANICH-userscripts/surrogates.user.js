// ==UserScript==
// @name selfhacked_surrogate
// @description Allows you to read articles on selfhacked without JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://selfhacked.com/blog/*
// ==/UserScript==

"use strict";

let loader = document.getElementById("loftloader-wrapper");
loader.parentElement.removeChild(loader);
