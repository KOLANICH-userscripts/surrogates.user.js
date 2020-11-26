// ==UserScript==
// @name google_drive_surrogate
// @description A surrogate for Google Drive
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://drive.google.com/file/d/*/view
// ==/UserScript==

"use strict";
if(!document.getElementById("uc-download-link")){
	let id = window.location.pathname.split("/")[3];
	if(id){
		window.location.href = "/uc?id=" + id;
	}
}
