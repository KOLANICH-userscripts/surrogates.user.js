// ==UserScript==
// @name OVD_info_surogate
// @description Allows to se content of OVD-info-related websites and fixes some features implemented via JS
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https:\/\/(\w+\.)?(?:ovdinfo\.org|ovd\.(?:news|legal)|inoteka\.io)\/.*/
// ==/UserScript==
"use strict";

function undoSabotage(){
	[...document.getElementsByClassName("page-wrapper")].forEach(e => {
		e.style.visibility = "unset"
	});
	document.getElementById("preloader").style.display = "none";
}

function fixSpoilers(){
	for(let e of document.querySelectorAll("[data-text]")) {
		let ds = e.dataset;
		if(ds){
			let t = ds["text"];
			ds["text"] = null;
			let d = document.createElement("details"), s = document.createElement("summary");
			d.innerHTML = t;
			e.parentElement.replaceChild(d, e);
			s.appendChild(e);
			d.insertBefore(s, d.firstChild)
		}
	}
}

function fixMenu() {
	document.getElementsByClassName("page-wrapper")[0].getElementsByTagName("HEADER")[0].style.position = "relative";
	let mmi = document.getElementById("header-mainmenu-items");
	mmi.style.display = "block";
	for (let g of mmi.getElementsByClassName("group-items")) {
		let t = g.getElementsByClassName("group-items-label")[0], w = g.getElementsByClassName("group-items-wrap")[0], d = document.createElement("details"), s = document.createElement("summary");
		t.parentElement.replaceChild(d, t);
		s.appendChild(t);
		d.appendChild(s);
		d.appendChild(w)
	}
}

undoSabotage();
fixSpoilers();
fixMenu();
