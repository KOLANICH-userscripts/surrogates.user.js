// ==UserScript==
// @name castbox_surogate
// @description Allows to see Castbox podcasts episodes.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://castbox.fm/channel/*
// @include https://castbox.fm/episode/*
// ==/UserScript==
"use strict";

const descriptorRx = /^\s*window\.__INITIAL_STATE__\s*=\s*"([^]+)"\s*;/im, imageSizeRx = /(\d+)x(\d+)bb.jpe?g/;

function getDescriptor(){
	let s = [...document.getElementsByTagName("script")].filter(el => -1 < el.textContent.indexOf("window.__INITIAL_STATE__"))[0].textContent;
	return JSON.parse(decodeURIComponent(descriptorRx.exec(s)[1]))
}

function indexDescriptorForEpisodes(descriptor){
	let descriptorIndex = new Map();
	for(let ep of descriptor["ch"]["eps"]){
		descriptorIndex.set(ep["eid"], ep);
	}
	return descriptorIndex;
}

var descriptor = getDescriptor();

function replaceImageWithPic(img, ep){
	let p = createPicture(ep);
	img.parentElement.replaceChild(p, img);
	p.appendChild(img);
}

function augmentExistingTableFromDescriptor(descriptor){
	let descriptorIndex = indexDescriptorForEpisodes(descriptor);
	let epRows = document.getElementsByClassName("episodeRow");
	for (let r of epRows) {
		for (let l of r.querySelectorAll("a")) {
			let p = l.href.split("-");
			let iD = null;
			if(p.length){
				iD = p[p.length - 1];
				if(iD.indexOf("id") == 0){
					iD = parseInt(iD.substring(2));
					let ep = descriptorIndex.get(iD);
					let controls = r.getElementsByClassName("ep-item-ctrls")[0];
					let playBtn = r.getElementsByClassName("play")[0];
					playBtn.href = ep["url"];

					let imgContainer = r.getElementsByClassName("coverImgContainer")[0];
					let img = imgContainer.getElementsByTagName("IMG")[0]
					replaceImageWithPic(img, ep);
				}
			}
		}
	}
}

function augmentExistingEpisodeFromDescriptor(descriptor, descriptorIndex){
	let ep = tpi["playItem"];
	let playBtnIcon = document.getElementsByClassName("player_play_btn")[0];
	let a = document.createElement("A");
	a.href = ep["url"];
	playBtnIcon.parentElement.replaceChild(a, playBtnIcon);
	a.appendChild(playBtnIcon);
	replaceImageWithPic(document.querySelector("img.cover"), ep);
}

function createPicture(ep){
	let p = document.createElement("picture");
	for(let vn of variants){
		let v = document.createElement("source"), u = ep[vn], s = u.split();
		s = s[s.length - 1];
		let m = imageSizeRx.exec(s), w = m[1], h = m[2];
		v.srcset = u;
		v.media = "(min-width: " + w + "px) and (min-height: " + h + "px)";
		p.appendChild(v)
	}
	return p;
}


const variants = ["small_cover_url", "cover_url", "big_cover_url"];

function generateListFromDescriptor(descriptor){
	let l = document.createElement("OL");
	for(let ep of descriptor["ch"]["eps"]){
		let a = document.createElement("A");
		a.href = ep["url"];
		let dt = document.createElement("time");
		dt.textContent = dt.datetime = ep["release_date"];
		let t = document.createElement("span");
		t.textContent = ep["title"];

		let p = createPicture();
		let img = new Image;
		img.src = ep["cover_url"];
		p.appendChild(img);

		let au = document.createElement("span");
		au.textContent = ep["author"];

		let li = document.createElement("li");
		l.appendChild(li);
		li.appendChild(a);
		a.appendChild(dt);
		a.appendChild(document.createTextNode(" "));
		a.appendChild(t);
		a.appendChild(document.createTextNode(" by "));
		a.appendChild(au);
		a.appendChild(p);
	}
	return l;
}

//document.body.appendChild(generateListFromDescriptor(getDescriptor())); // no longer needed, they generate HTML themselves now.
let tpi = descriptor["trackPlayItem"];
if(tpi){
	augmentExistingEpisodeFromDescriptor(descriptor);
} else {
	augmentExistingTableFromDescriptor(descriptor);
}
