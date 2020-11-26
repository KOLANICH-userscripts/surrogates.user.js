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

var metadata = JSON.parse(document.querySelectorAll("script[type='application/json']")[0].textContent);
var articleDescriptor = metadata["article"];
var lb = null;
{
	let cta = document.getElementsByClassName("PrimaryCtaButton");
	if(cta.length){
		lb = cta[0].getElementsByClassName("link-button-primary")[0];
	} else {
		lb = document.querySelector("a > .pdf-icon").parentElement;
	}
}

//let doiContainer = document.createElement("DIV");
//doiContainer.textContent = "DOI: " + articleDescriptor["doi"];
//lb.parentNode.appendChild(doiContainer, lb);


var downloadDescriptor = articleDescriptor["pdfDownload"];
if(downloadDescriptor && downloadDescriptor["linkType"] == "DOWNLOAD"){
	let umd = downloadDescriptor["urlMetadata"];
	let pii = umd["pii"];
	if(umd){
		let uqp = umd["queryParams"];
		let downloadLinkVariant1 = null;
		if(uqp && pii){
			let res = [];
			for(let n in uqp){
				res.push([n, encodeURIComponent(uqp[n])].join("="));
			}
			
			downloadLinkVariant1 = pii + "/" + "pdf?" + res.join("&");
		}

		let downloadLinkVariant2 = pii + umd["pdfExtension"];
		let ll = document.createElement("A");
		ll.innerHTML = lb.innerHTML;
		ll.className = lb.className;
		ll.href = downloadLinkVariant2;
		lb.parentNode.replaceChild(ll, lb);
	}
}
