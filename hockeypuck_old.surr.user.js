// ==UserScript==
// @name old_hockeypuck_nojs
// @description Allows to use an old version of a hockeypuck without JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://keyserver.ubuntu.com/
// ==/UserScript==
"use strict";
let d = document, g = d.getElementById.bind(d);
g("advancedOptionsCollapse").style.display = "block";
g("myModal").className = "";
