// ==UserScript==
// @name sociumin_surrogate
// @description Allows to view profiles on sociumun without enabling JavaScript.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant GM.xmlHttpRequest
// @run-at document-idle
// @match https://sociumin.com/?id=*
// ==/UserScript==

"use strict";

[...document.querySelectorAll("img[data-src]")].forEach(e => {e.src = e.dataset.src});

let ps = document.getElementById("photoSlide");
if (ps) {
	let header = ps.previousSibling, ds = document.createElement("DETAILS"), newHeader = document.createElement("SUMMARY"), cont = document.createElement("DIV");
	ds.id = ps.id;
	cont.style.display = "flex";
	cont.style.flexWrap = "wrap";
	cont.style.objectFit = "fill";
	cont.style.width = "100%";
	ds.appendChild(newHeader);
	newHeader.appendChild(header);
	ds.appendChild(cont);
	for (let el of ps.childNodes){
		cont.appendChild(el);
	}
	ps.parentElement.replaceChild(ds, ps)
};
