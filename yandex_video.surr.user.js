// ==UserScript==
// @name yandex_video_surrogate
// @description Allows to play Yandex Video without Yandex-shipped JS. You need to allow `storage.mds.yandex.net` and `static.video.yandex.net` in uMatrix in order to use this!
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://video.yandex.ru/*
// ==/UserScript==

'use strict';
function makePlayer(files, poster, subtitles, root){
	if(getComputedStyle(root).display=='none')
		root.style.display='';
	let player=root.getElementsByTagName('video')[0];
	if(!player){
		player=document.createElement('video');
		root.appendChild(player);
	}
	for(let file of files){
		let el = document.createElement('source');
		el.src=file.src;
		el.type=file.type;
		player.appendChild(el);
	}
	player.controls=true;
	player.poster=poster;
	
	/*for(let file of subtitles){
		let el = document.createElement('track');
		el.kind='subtitles';
		el.src='';
		el.srclang='ru';
		el.label='Russian';
		player.appendChild(el);
	}*/
}

const resolutions={
	'sq':   [ 480, 360],
	'360p': [ 480, 360],
	'480p': [ 704, 480],
	'720p': [1280, 720],
	'1080p':[1920,1080],
};
function decodeResolution(res){
	return resolutions[res];
}
function makeUrlFromStupidUrl(url){
	return url;
}

function getInfoFromURI(uriObj){
	let login, id;
	[ , , login, id]=uriObj.pathname.split('/');
	return [login, id];
}

function fetchShit(jsonResponse){
	//console.dir(jsonResponse);
	let name = jsonResponse.title;
	let description = jsonResponse.description;
	let durationMillis = jsonResponse['duration-millis'];
	let files=[];
	for(let file of jsonResponse['video-files'].items){
		let obj={};
		obj.bitrate=file.bitrate;
		[obj.width, obj.height]=decodeResolution(file.quality);
		[obj.width, obj.height]=[file.width||obj.width, file.height||obj.height];
		obj.format=file.format;
		obj.type=file['mime-type'];
		obj.src=file['get-with-redirect-url'];
		//obj.src=file['get-location-url'];
		files.push(obj);
	}
	let posterSrc=jsonResponse['screenshots']['selected']['get-url'];
	let subtitles=jsonResponse['subtitles']['items'];
	return {name, description, posterSrc, durationMillis, files, subtitles};
}

function retrieveInfoAboutVideo(el){
	let descr = JSON.parse(el.dataset.params);
	console.dir(descr);
	let login, id;
	{
		let info0=getInfoFromURI(location);
		let info1=descr.media.token.replace(/^undefined/, '').split('/');
		    login=descr.flash.login           ||info1[0]||info0[0];
		       id=descr.flash.storageDirectory||info1[1]||info0[1];
	}
	console.log(login,id);
	let base=descr.flash.storageUrl;
	let files=[];
	for(let formatName in descr.html5){
		let format=descr.html5[formatName];
		for(let fileQualityStupidName in format.bitrate){
			let file=format.bitrate[fileQualityStupidName];
			let obj={};
			obj.bitrate=file.bitrate;
			console.log(file);
			[obj.width, obj.height]=decodeResolution(file.file);
			obj.format=formatName;
			obj.type=format.mimeType;
			obj.src=makeUrlFromStupidUrl(format.videoUrl);
			files.push(obj);
		}
	}
	return fetch(`${base}/get/${login}/${id}/0h.xml?nc=${Math.random()}`).then( r => r.json()).then(fetchShit).then(function(res){
		console.dir(res);
		for(let file in files){
			if(!res.files[file])
				res.files[file]=files[file];
		}
		return res;
	});
}

function main(){
	let els = Array.from(document.querySelectorAll('div#player.embed'));
	for(let el of els){
		retrieveInfoAboutVideo(el).then(function(res){
			makePlayer(sortFiles(res.files), res.posterSrc, res.subtitles, el);
		}).catch(console.error);
	}
	
}

function sortFiles(files){
	return files.sort(function(f1, f2){f1.width*f1.height>f2.width*f2.height});
}

main();
