// ==UserScript==
// @name gitea_surrogate
// @description Fixes some parts of the GUI implemented via JS
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https://(?:codeberg\.org)/[\w.-]+/[\w.-]+/settings$/
// ==/UserScript==
"use strict";
for (let el of [...document.getElementsByClassName("show-modal button")]) {
	let className = el.dataset.modal.substring(1);
	const modalEl = document.getElementById(className);
	el.addEventListener("click", () => {
		console.log(modalEl);
		modalEl.className += " active front transition";
		modalEl.scrollIntoView();
	});
	console.log("className", className, modalEl.innerHTML);
	modalEl.getElementsByClassName("cancel button")[0].addEventListener("click", () => {
		modalEl.className = modalEl.className.replace("active", "").replace("front", "").replace("transition", "").replace(/\s+/, " ");
	});
}
