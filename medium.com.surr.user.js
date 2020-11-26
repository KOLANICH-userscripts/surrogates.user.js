// ==UserScript==
// @name medium_nojs_surrogate
// @description Allows to read some medium-based sites without JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://medium.com/*
// @match https://towardsdatascience.com/*
// ==/UserScript==

"use strict";

let s=window.location.search;
function addition(){
	let c=new Uint8Array(12);
	window.crypto.getRandomValues(c);
	return"gi="+[...c].map(h=>(h%16).toString(16)).join("")
}

if(s){
	let shouldAdd;
	a:{
		"?"==s[0]&&(s=s.slice(1));
		s=s.split("&");
		for(let el of s){
			el=el.split("="), console.log(el);
			if(2 == el.length && "gi" == el[0] && el[1]){
				shouldAdd=!1;
				break a
			}
		}
		shouldAdd=!0
	}
	shouldAdd && (window.location.search += "&"+ addition())
} else {
	window.location.search += "?" + addition();
}

