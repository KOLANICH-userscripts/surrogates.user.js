// ==UserScript==
// @name tempmail.dev_surrogate
// @description tempmail.dev surrogate
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://tempmail.dev/*
// ==/UserScript==

"use strict";

let e = null;

{
	const emailBase = document.baseURI + "Email/";

	class Email {
		constructor(s) {
			this.s = s;
			this.currentMailboxInfo = null;
			this.recoverCodes = new Map;
		}
		async init(){
			if (!this.s["recoverCodes"]) {
				this.s["recoverCodes"] = "{}";
				await this.getNew()
			} else {
				this.currentMailboxInfo = JSON.parse(this.s["r"]);
				this.s["recoverCodes"]
			}
			return this
		}
		processNew(r) {
			console.log(r);
			this.currentMailboxInfo = r;
			this.s["r"] = JSON.stringify(r);
			return this.currentMailboxInfo["Email"];
		}
		getNew() {
			return this.getNewWithURI(emailBase + "newEmail");
		}
		forget() {
			return this.getNewWithURI(emailBase + "delete");
		}
		getNewWithURI(uri) {
			this.forgetRecoverably();
			return fetch(uri, {
				method: "POST"
			}).then(r => r.json()).then(this.processNew.bind(this))
		}
		forgetLocally() {
			delete this.s["r"], this.currentMailboxInfo = null
		}
		serializeRecoveryInfo() {
			this.s["recoverCodes"] = JSON.stringify(Object.fromEntries(this.recoverCodes.entries()));
		}
		parseRecoverInfo() {
			this.recoverCodes = Map.fromEntries(Object.entries(JSON.parse(this.s["recoverCodes"])));
		}

		forgetRecoverably() {
			this.currentMailboxInfo && (this.recoverCodes.set(this.currentMailboxInfo["Email"], this.currentMailboxInfo["Recovery"]), this.forgetLocally())
		}

		getInbox() {
			return fetch(emailBase + "inbox", {
				method: "POST"
			}).then(r => r.json());
		}
		recover(name) {
			fetch(emailBase + "recovery/" + name, {
				method: "POST"
			})
		}
	}
	e = new Email(window.localStorage);
}

e.init().then(e => {
	let cmaw = document.getElementById("current-mail"), emailsW = document.getElementById("inbox-dataList");
	document.getElementsByClassName("mail-empty")[0].classList.add("d-none");
	emailsW.classList.remove("d-none");
	cmaw.textContent = e.currentMailboxInfo["Email"];
	
	let timerEl = document.getElementsByClassName("timer-area")[0];
	timerEl.classList.add("d-none");

	let counter = 0;

	function refresh() {
		console.log("Requesting refresh ...");
		timerEl.classList.remove("d-none");
		e.getInbox().then(el2 => {
			console.log("Got results", el2);
			timerEl.classList.add("d-none");
			for (let e of el2.slice(counter)) {
				el2 = document.createElement("div");
				el2.className = "mail-details";

				let parentEl = document.createElement("div");
				parentEl.className = "info";
				parentEl.textContent = e["subject"];
				el2.appendChild(parentEl);

				parentEl = document.createElement("time");
				parentEl.textContent = e["date"];
				el2.appendChild(parentEl);

				parentEl = document.createElement("div");
				parentEl.className = "sender";
				parentEl.textContent = el2.appendChild(parentEl);

				let el = document.createElement("label");
				el.textContent = "From:";
				parentEl.appendChild(el);

				el = document.createElement("span");
				el.textContent = e["fromName"];
				parentEl.appendChild(el);

				parentEl.appendChild(document.createTextNode("<"));

				el = document.createElement("span");
				el.textContent = e["fromEmail"];
				parentEl.appendChild(el);

				parentEl.appendChild(document.createTextNode(">"));

				parentEl = document.createElement("div");
				el2.appendChild(parentEl);

				parentEl.innerHTML = e["bodyHtml"];
				emailsW.appendChild(el2);

				counter += 1
			}
		})
	}

	let copyBtn = document.getElementsByClassName("current-button")[0];
	copyBtn.style.display = "none";

	let refreshBtn = document.getElementById("click-to-refresh2");
	refreshBtn.addEventListener("click", refresh, !1);
	refresh();
});
