// ==UserScript==
// @name data.mos.ru_surogate
// @description Allows to view datasets on data.mos.ru without their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://data.mos.ru/opendata/*
// ==/UserScript==
"use strict";
for(let el of document.getElementsByClassName("page-container")){
	el.style.display = "";
}
