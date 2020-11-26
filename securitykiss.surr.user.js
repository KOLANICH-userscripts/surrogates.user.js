// ==UserScript==
// @name securitykiss_surrogate
// @description Allows you to obtain your personal SecurityKiss Wireguard "private" (in fact, not really private, real private keys must be generated client side) key without running their JavaScript.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://securitykiss.com/download.html
// ==/UserScript==

// todo: Contact helpdesk@securitykiss.com and ask them to replace their impl with my one

"use strict";

const SecurityKissAPIBase = 'https://cm.securitykiss.com/';

class SecurityKissAPI {
	static get(partialUri, jsonDict = null) {
		if(jsonDict){
			let queryPart = [];
			for (let [k, v] of Object.values(jsonDict)) {
				queryPart.push(k + "=" + encodeURIComponent(v));
			}
			partialUri+="?" + queryPart.join("&");
		}
		return fetch(SecurityKissAPIBase + partialUri, {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			headers: {}
		});
	}

	static post(partialUri, jsonDict = null) {
		// fetch doesn't work!!!
		let req = new XMLHttpRequest();
		req.open("POST", SecurityKissAPIBase + partialUri);
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); // Extremily strange, it must be application/json
		return new Promise((resolve, reject) => {
			req.addEventListener('load', (e) => {
				resolve({
					"json": () => {
						return new Promise((resolve, reject) => {
							resolve(JSON.parse(req.responseText));
						});
					},
					"text": () => {
						return new Promise((resolve, reject) => {
							resolve(req.responseText);
						});
					}
				});
			});
			req.send(jsonDict ? new Blob([JSON.stringify(jsonDict)], {
				type: 'application/json'
			}) : null);
		});
	}

	static jsonPost(partialUri, jsonDict = null) {
		return this.post(partialUri, jsonDict).then(res => res.json());
	}

	static textPost(partialUri, jsonDict = null) {
		return this.post(partialUri, jsonDict).then(res => res.text());
	}

	static jsonGet(partialUri, jsonDict = null) {
		return this.get(partialUri, jsonDict).then(res => res.json());
	}

	static textGet(partialUri, jsonDict = null) {
		return this.get(partialUri, jsonDict).then(res => res.text());
	}

	static requestUserId() {
		return this.textPost("api/genusid");
	}

	static getVepList(userID) {
		if (!userID) {
			throw new Error("userID is mandatory!");
		}
		return this.jsonPost("api/veplist", {
			"Usid": userID
		});
	}

	static getClientConfigLinks(userID, vepID) {
		if (!userID) {
			throw new Error("userID is mandatory!");
		}
		if (!vepID) {
			throw new Error("vepID is mandatory!");
		}
		return this.jsonPost("api/clientconfig", {
			"Usid": userID,
			"Vepid": vepID
		});
	}

	static getGeo() {
		return this.jsonGet("geo");
	}

	static getDatabox(token) {
		if(!token){
			throw new Error("You must specify token");
		}
		return this.jsonGet("databox", {
			"token": encodeURIComponent(token)
		});
	}

	static getAppDownloadLink(appType="win") {
		return this.jsonPost("api/appupdate", {
			"Apptype": appType + "app",
			"Version": "0.0.0"
		});
	}

	static getPlans() {
		return this.jsonGet("api/payableitems");
	}
};

const remapping = {
	"Id": "ID",
	"Name": "Name",
	"Country": "State",
	"Cc": "State_ISO_code",
	"City": "City",
	//"Dns": "Recommended_DNS" /* Always 8.8.8.8/32, it is Google public DNS */ ,
	"Ipnet": "Interface_Address",
	"Eport": "Endpoint_port",
	"Eipnet": "Endpoint_IP",
	"Pubkey": "Peer_PublicKey",
};

class VEP {
	static keys() {
		return Object.values(remapping);
	}

	constructor(parent, id = null) {
		this.parent = parent
		this.configLinks = null
		for (let rk of this.constructor.keys()) {
			this[rk] = null;
		}
		this.ID = id;
	}

	initFromJsonObject(jso) {
		for (let [k, rk] of Object.entries(remapping)) {
			this[rk] = jso[k];
		}
		return this;
	}

	* values() {
		for (let rk of this.constructor.keys()) {
			yield this[rk];
		}
	}

	* entries() {
		for (let rk of this.constructor.keys()) {
			yield [rk, this[rk]];
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	async getConfigLinks() {
		if (!this.configLinks) {
			this.configLinks = SecurityKissAPI.getClientConfigLinks(this.parent.userID, this.ID);
			this.configLinks = await this.configLinks;
		}
		return this.configLinks
	}
	async getConfigURI() {
		return (await this.getConfigLinks())["Txt"]
	}
	async getQrURI() {
		return (await this.getConfigLinks())["Qr"];
	}
	async getConfig() {
		return SecurityKissAPI.getText(await this.getConfigURI());
	}
};

class SecurityKiss {
	constructor(userID = null) {
		this.userID = userID;
		this.veps = null;
	}
	async getUserId() {
		if (!this.userID) {
			this.userID = await SecurityKissAPI.requestUserId();
		}
		return this.userID
	}

	*convertVeps(veps) {
		for (let vepJSO of veps) {
			let v = new VEP(this);
			v.initFromJsonObject(vepJSO);
			yield v;
		}
	}

	async getVeps() {
		if (!this.veps) {
			this.veps = [...this.convertVeps(await SecurityKissAPI.getVepList(await this.getUserId()))];
		}
		return this.veps;
	}
}


const newUserBtn = document.getElementById("getconfaction"),
existingUserCbx = document.getElementById("existing-user-chb"),
stepTwoContainer = document.getElementById("step-two"),
configInnerBox = document.getElementById("getconfiginner"),
mySubscriberIdArea = document.getElementById("sid-enter"),
mySubscriberIdField = document.getElementById("sid");

mySubscriberIdField.required = !0;
mySubscriberIdField.pattern = "\\d{5}(?:-\\d{5}){3}";
mySubscriberIdField.title = "4 groups of 5 digits each, separated with dashes (" + mySubscriberIdField.placeholder + ")";
{
	let s = document.createElement("STYLE");
	s.textContent = "#sid:invalid {border-color: red;};#sid:valid {border-color: green;};";
	document.head.appendChild(s);
}

const mySubscriberIdIndicationDiv = document.getElementById("sid-value");
const sk = new SecurityKiss;

function getStuffForAUser(userID = null) {
	sk.userID = userID;
	sk.getVeps().then((veps) => {
		stepTwoContainer.style.display = "block";
		mySubscriberIdField.value = mySubscriberIdIndicationDiv.textContent = sk.userID;
		existingUserCbx.checked = !0;
		onExistingUserCbxToggle();

		let t = document.createElement("TABLE"), tr = document.createElement("THEAD");
		t.appendChild(tr);
		let tbd = document.createElement("TBODY"), rk_td;
		t.appendChild(tbd);
		for (rk_td of Object.values(remapping)) {
			let th = document.createElement("TH");
			th.textContent = rk_td.replace("_", " ");
			tr.appendChild(th)
		}

		for (let vep of sk.veps) {
			tr = document.createElement("TR");
			for (let [k, v] of vep) {
				rk_td = document.createElement("TD");
				if (k == "ID") {
					let a = document.createElement("A");
					a.textContent = v;
					let cb = (evt) => {
						a.removeEventListener("click", cb, false);
						vep.getConfigURI().then((uri) => {
							a.href = uri;
						}).then(
							() => {
								vep.getQrURI().then(
									(uri) => {
										let i = new Image;
										i.src = uri;
										i.style.height = i.style.width = "10em";
										a.appendChild(i)
									}
								);
							},
							(err) => {
								a.textContent = err;
							}
						);

					};
					a.addEventListener("click", cb, !1);
					rk_td.appendChild(a);
				} else {
					rk_td.textContent = v;
				}
				tr.appendChild(rk_td);
			}
			tbd.appendChild(tr);
		}

		configInnerBox.appendChild(t);
		configInnerBox.scrollIntoView();
	});
}

newUserBtn.addEventListener("click", (evt) => {
	getStuffForAUser(mySubscriberIdField.value ? mySubscriberIdField.value : null);
}, !1);

function onExistingUserCbxToggle(){
	mySubscriberIdField.reportValidity();
	mySubscriberIdArea.style.display = (existingUserCbx.checked ? "block" : "none");
}

existingUserCbx.addEventListener("change", (evt) => {
	onExistingUserCbxToggle();
}, !1);

mySubscriberIdField.addEventListener("change", (evt) => {
	evt.target.reportValidity();
}, !1);
