// ==UserScript==
// @name substack_surrogate
// @description Removes modal HTML+JS-based popup on substack.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https:\/\/\w+\.substack\.com\/.*/
// ==/UserScript==

"use strict";
document.getElementsByClassName("intro-popup")[0].style.display = "none";
