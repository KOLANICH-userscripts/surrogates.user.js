// ==UserScript==
// @name googlag_books
// @description Undoes sabotage of Googlag to view pages on Googlag Books without their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://books.google.ru/books?*
// ==/UserScript==

"use strict";
let a = document.getElementsByClassName("html_page_secure_image");

if (a.length){
	for (let b of a){
		b.style.backgroundImage = "";
		b.className = "html_page_image";
	}
}
