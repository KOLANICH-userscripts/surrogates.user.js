// ==UserScript==
// @name sciencedirect_surrogate
// @description Allows to download papers from ScienceDirect without Elsevier-supplied JavaScript
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://www.sciencedirect.com/science/article/pii/*
// ==/UserScript==

"use strict";


let articleDescriptor = JSON.parse(document.querySelectorAll("script[type='application/json']")[0].textContent)["article"],
	btn = document.getElementById("pdfLink"),
	downloadDescriptor = articleDescriptor["pdfDownload"];
//let doiContainer = document.createElement("DIV");
//doiContainer.textContent = "DOI: " + articleDescriptor["doi"];
//lb.parentNode.appendChild(doiContainer, lb);
if (downloadDescriptor && "DOWNLOAD" == downloadDescriptor["linkType"]) {
	let umd = downloadDescriptor["urlMetadata"],
		pii = umd["pii"];
	if (umd) {
		let downloadLinkVariant1;
		let uqp = umd["queryParams"];
		if (uqp && pii) {
			let downloadLinkVariant1Comps = [], k;
			for (k in uqp){
				downloadLinkVariant1Comps.push([k, encodeURIComponent(uqp[k])].join("="))
			}
			downloadLinkVariant1 = downloadLinkVariant1Comps.join("&");
		}
		let downloadLinkVariant2 = pii + umd["pdfExtension"], l = document.createElement("A");
		l.innerHTML = btn.innerHTML;
		l.className = btn.className;
		l.href = downloadLinkVariant2;
		btn.parentNode.replaceChild(l, btn);
	}
}
