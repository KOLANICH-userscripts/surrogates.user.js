// ==UserScript==
// @name fosshub_download_surrogate
// @description Allows to download software from FOSSHub. On the first click the link will go highlighted, replacing its URI with the direct link.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://www.fosshub.com/*
// ==/UserScript==

let cands = [...document.getElementsByTagName("SCRIPT")].filter(e => !e.src).map(e=>e.textContent.match(/(?:var|let)\s+settings\s*=\s*(\{.+)/m)).filter(e => !!e);
let cand = cands[cands.length -1];
let d = JSON.parse(cand[1]);
let map = new Map();
for(let it of d["pool"]["f"]){
	map.set(it["n"], it);
}

function downloadElement(callee, fileNamePostProcessor, e){
	console.log(e);
	e.preventDefault();
	e.stopPropagation();

	let tgt = e.currentTarget;
	console.log(tgt);
	let fn = fileNamePostProcessor(tgt.dataset.file);
	console.log(fn);
	let it = map.get(fn);
	console.log(it);
	
	return fetch('https://api.fosshub.com/download/', {"method": "POST", "headers": {
			"X-Requested-With": "XMLHttpRequest",
			"Content-Type": "application/json",
		}, "body":JSON.stringify({
			projectId: d["pool"]["p"],
			releaseId: it["r"],
			projectUri: d["pool"]["u"],
			fileName: fn,
			source: d["pool"]["c"]
		})
	}).then(res => res.json()).then(descr => {
		console.log(descr);
		tgt.href = descr["data"]["url"];
		tgt.removeEventListener("click", callee, true);
		tgt.removeEventListener("contextmenu", callee, true);
		tgt.style.textShadow = "cyan 0px 0px 1px, red 0px 0px 3px";
	});
}
function downloadFileElement(e){
	return downloadElement(downloadFileElement, s => s, e);
}
function downloadSigElement(e){
	return downloadElement(downloadSigElement, s => s+".asc", e);
}

function setupListeners(el, f){
	el.addEventListener("click", f, true);
	el.addEventListener("contextmenu", f, true);
}

for(let el of document.querySelectorAll("a[data-download=true]")){
	setupListeners(el, downloadFileElement);
}

for(let el of document.querySelectorAll("a.fSignature")){
	setupListeners(el, downloadSigElement);
}
