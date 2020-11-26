// ==UserScript==
// @name android_file_host_surrogate
// @description Allows to download from AndroidFileHost without their (and CloudFlare browser fingerprinting script)
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://androidfilehost.com/?fid=*
// ==/UserScript==

var dgebi = (n) => document.getElementById(n);

function BigIntPolyfill(){
	if(typeof BigInt != "undefined"){
		return BigInt;
	} else {
		return BigIntMaybeSurrogate = (x) => x;
	}
}
const BigIntMaybeSurrogate = BigIntPolyfill();
delete BigIntPolyfill;

function getBaseURI(href){
	let a = document.createElement("A");
	a.href = href;
	a.search = a.pathname = "";
	return a.href;
}


function delay(to) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, to);
	});
}

class IMirror {
	getURI() {}
};


class Mirror extends IMirror {
	constructor(id, name, abbr, addr, path, isOnline, isSelectable, isArchive, weight, isTemporary, type, url) {
		super();
		this.id = id;
		this.name = name;
		this.abbr = abbr;
		this.addr = addr;
		this.path = path;
		this.isOnline = isOnline;
		this.isSelectable = isSelectable;
		this.isArchive = isArchive;
		this.weight = weight;
		this.isTemporary = isTemporary;
		this.type = type;
		this.url = url;
	}

	getURI() {
		if (this.type == 1) {
			return this.url;
		} else {
			return "https://" + this.addr + this.path + '/download.php'
		}
	}
};

class FileMirror extends IMirror {
	constructor(download, mirror) {
		super();
		this.download = download;
		this.mirror = mirror;
	}

	getURI() {
		return this.mirror.getURI() + "?fid=" + this.download.id;
	}
};

function mirrorFromJSON(m) {
	return new Mirror(
		m["mid"],
		m["name"],
		m["abbrev"],
		m["address"],
		m["path"],
		parseInt(m["mirror_status"]),
		parseInt(m["selectable"]),
		parseInt(m["archive"]),
		parseInt(m["weight"]),
		parseInt(m["temporary"]),
		parseInt(m["type"]),
		m["url"],
	);
}

class AFH {
	constructor(site = "") {
		this.otfPrefix = site + '/libs/otf';
	}

	getStatsAPI(mirror, fileId) {
		fetch(this.otfPrefix + "/stats.otf.php?fid=" + fileId + "&w=download&mirror=" + mirror).then(r => r.json())
	}

	getDelayInfoAPI() {
		return fetch(
			this.otfPrefix + '/checks.otf.php', {
				"method": "POST",
				"body": "w=waitingtime",
				"mode": "same-origin",
				"redirect": "error",
				"referrer": window.location.href,
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"X-Requested-With": "XMLHttpRequest",
				},
			}
		).then(r => r.json());
	}

	delay(startCallback) {
		return this.getDelayInfoAPI().then(r => {
			console.log(r);
			let t = parseInt(r["waitTime"]);
			t += 2;
			if(startCallback){
				startCallback(t);
			}
			return delay(t * 1000);
		})
	}

	getMirrorsAPI(fileId) {
		if(!fileId){
			throw new Error("fileId must be present, otherwise backend returns empty mirrors list")
		}
		let body = "submit=submit&action=getdownloadmirrors&fid=" + fileId;
		return fetch(
			this.otfPrefix + '/mirrors.otf.php', {
				"method": "POST",
				"body": body,
				"mode": "same-origin",
				"redirect": "error",
				"referrer": window.location.href,
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"X-Requested-With": "XMLHttpRequest",
				},
			}
		).then(r => r.json());
	}
	async getMirrors(fileId) {
		if(!fileId){
			throw new Error("fileId must be present, otherwise backend returns empty mirrors list")
		}
		let r = await this.getMirrorsAPI(fileId);
		let st = parseInt(r["STATUS"]);
		console.log(st, r["MESSAGE"], r);
		if (st == 1) {
			r["AUTO_START"];
			let mirrors = r["MIRRORS"];
			let res = [];
			for (let m of mirrors) {
				res.push(mirrorFromJSON(m));
			}
			return res;
		} else {
			return Promise.reject(r["MESSAGE"]);
		}
	}

	download(fileId) {
		return new Download(this, fileId);
	}
};

class Download {
	constructor(parent, id) {
		this.parent = parent;
		this.id = id;
	}

	async getMirrors() {
		let mirrors = await this.parent.getMirrors(this.id);
		let res = [];
		for (let m of mirrors) {
			res.push(new FileMirror(this, m));
		}
		return res;
	}
};

class CountDown{
	constructor(el){
		this.el = el;
		this.to = null;
		this.count = null;
	}
	decrement(){
		this.count--;
		this.nextIter();
	}
	nextIter(){
		this.el.textContent = this.count;
		if(this.count){
			this.addTimeout();
		}
	}
	stop(){
		clearTimeout(this.to);
	}
	addTimeout(){
		this.to = setTimeout(()=>{this.decrement();}, 1000);
	}
	start(count){
		this.count = count
		this.nextIter();
	}
};

let api = new AFH(getBaseURI(window.location.href));
var loadMirrorEl = dgebi("loadMirror");
var timerEl = dgebi("dl-timer");
var secondsEl = timerEl.getElementsByClassName("seconds");

async function doWork(fileId, beforeTimerCallback) {
	await api.delay(beforeTimerCallback);
	let d = api.download(fileId);
	let mirrors = await d.getMirrors();
	if (!mirrors.length) {
		return Promise.reject("The server rejects to give out mirrors");
	}
	console.log(mirrors);
	return mirrors;
}

loadMirrorEl.addEventListener("click", (evt)=>{
	evt.target.classList.add('hidden');
	let reportEl = dgebi("dl-notice");
	let statusEl = dgebi("dl-status");
	let mirrorsListEl = dgebi("mirrors");
	reportEl.textContent = "Downloading delay amount...";
	let cd = new CountDown(timerEl);
	var fileId = BigIntMaybeSurrogate(document.getElementById("fid").value);
	
	doWork(fileId, (t) => {
		timerEl.style.display = "block";
		timerEl.classList.remove('hidden');
		reportEl.textContent = 'Delaying ' + t;
		cd.start(t);
	}).then(mirrors => {
		reportEl.textContent = "Mirrors fetched";
		statusEl.textContent = "Select the mirror";
		mirrorsListEl.classList.remove('hidden');
		
		for (let m of mirrors) {
			console.log(m);
			let downElement = document.createElement("A");
			downElement.href = m.getURI();
			downElement.rel = "downloadn";
			downElement.className = "list-group-item download";
			downElement.textContent = m.mirror.name + (m.mirror.isOnline?"✔":"❌");
			mirrorsListEl.appendChild(downElement);
		}
	});
}, false);
