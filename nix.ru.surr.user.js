// ==UserScript==
// @name nix.ru_surrogate
// @description Undoes sabotage
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://www.nix.ru/price/price_list.html?*
// ==/UserScript==

"use strict";
[...document.getElementsByClassName("hidden-content")].forEach(el => {el.className = el.className.replace("hidden-content", "");})

