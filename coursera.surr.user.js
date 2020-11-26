// ==UserScript==
// @name coursera_surrogate
// @description Allows to watch Coursera without their JavaScript
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://www.coursera.org/lecture/*
// @match https://www.coursera.org/learn/*
// ==/UserScript==

"use strict";

[...document.getElementsByClassName("collapsed")].forEach(e => {
	e.classList.toggle("collapsed");
	for(let ee of e.getElementsByClassName("content")){
		ee.style.height = "";
	}
});

[...document.getElementsByClassName("overflow-hidden")].forEach(e => {
	e.classList.toggle("overflow-hidden");
	e.style.height = "";
	for(let ee of e.getElementsByClassName("visibility-hidden")){
		ee.classList.toggle("visibility-hidden");
	}
});


function parseMetadata() {
	const infoParsers = {
		"apolloState": /__APOLLO_STATE__\s*=\s*(\{.+\})\s*;\s*window\.renderedClassNames/,
		"renderedClassNames": /window\.renderedClassNames\s*=\s*(\[[^\]]+\]);/
	};

	let res = {};
	for(let s of document.getElementsByTagName("SCRIPT")){
		if(!s.src){
			for(let [k,rx] of Object.entries(infoParsers)){
				let m = rx.exec(s.textContent);
				if(m){
					res[k] = JSON.parse(m[1]);
				}
			}
		}
	}
	return res;
}

function getTypez(md){
	let typez = {};

	for(let [k,v] of Object.entries(md.apolloState)){
		if(v["typeName"] && v["id"]){
			let tC = typez[v["typeName"]];
			if(!tC){
				tC = typez[v["typeName"]] = {"id":{}, "name":{}};
			}
			tC["id"][v["id"]] = v;
			tC["name"][v["name"]] = v;
		}
	}
	return typez;
}

let md = parseMetadata();
function getCourseEl(md){
	for(let el of Object.values(md["apolloState"] ["$ROOT_QUERY.CoursesV1Resource"])){
		let id = el["id"];
		if(id){
			return md["apolloState"][id]
		}
	}
}


let course = getCourseEl(md);

let typez = getTypez(md);

let classIndexPairs = [
	["m-y-2", "lecture"],
];
let materialRx = /^(.+?)(\d+m)$/;

var nounsRemap = {
	"readings": "supplement",
	"practice": "exam",
	"videos": "lecture",
};

let sil = document.getElementsByClassName("Syllabus")[0];

if(sil){
	let weeks = sil.getElementsByClassName("SyllabusWeek");
	for(let w of weeks){
		let modules = sil.getElementsByClassName("SyllabusModule");
		for(let m of modules){
			for(let det of m.getElementsByClassName("SyllabusModuleDetails")){
				for(let g of m.getElementsByClassName("ItemGroupView")){
					let i = g.getElementsByClassName("learning-item")[0];
					//console.log(i);
					let noun = i.textContent.split(" ")[1];
					let idxType = nounsRemap[noun];
					let idx = typez[idxType];
					for(let item of g.querySelectorAll(".m-y-2")){
						let ma = materialRx.exec(item.textContent);
						if(ma){
							var name = ma[1];
							let imd = idx["name"][name];
							if(imd){
								console.log(item)
								let a = document.createElement("A");
								a.href = window.location.href;
								a.search = "";
								a.pathname = idxType + "/" + course["slug"] + "/" + imd["slug"] + "-" + imd["id"];
								let p = item.parentElement;
								item.parentElement.replaceChild(a, item);
								a.appendChild(item);
							}
						}
					}
				}
			}
		}
	}
} else {
	let vmd = JSON.parse(document.querySelectorAll("script[type='application/ld+json']")[0].textContent);
	for(let el of Object.values(vmd["@graph"])){
		if("VideoObject" == el["@type"]){
			console.log(el);
			let videoContainer = document.querySelector("[alt=video-placeholder]").parentElement,
			titleEl = videoContainer.parentElement.parentElement.getElementsByTagName("H2")[0];

			let vt = document.createElement("VIDEO");
			vt.src = el["contentURL"];
			vt.poster = el["thumbnailURL"];
			vt.controls = !0;
			vt.style.width = "100%";


			let vc2 = videoContainer.parentElement;
			vc2.parentElement.replaceChild(vt, vc2);

			let a = document.createElement("A");
			a.textContent = titleEl.textContent;
			a.href = el["contentURL"];
			a.download = el["name"] + ".mp4";
			titleEl.textContent = "";
			titleEl.appendChild(a);
			
			break;
		}
	}
}

