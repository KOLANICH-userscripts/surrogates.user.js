// ==UserScript==
// @name Wikipedia_bug_workaround_surrogate
// @description Fix the bug with unopenable menu with interwiki (other languages) links
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /https:\/\/\w{2,3}\.?wikipedia\.org\/wiki\/.+/
// ==/UserScript==

"use strict";
document.querySelector(".mw-portlet-lang > .vector-menu-content").style.display="block";
