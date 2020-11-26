// ==UserScript==
// @name tmail_surrogate
// @description A surrogate for temporary email providers using TMail engine
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://tempmail4me.eu/mailbox/*
// @include https://mailpoof.com/mailbox/*
// @include https://throwaway.io/mailbox/*
// @include https://www.emailryder.com/mailbox/*
// @include https://stopgap.email/mailbox/*
// @include https://www.2minmail.com/mailbox/*
// @include https://fani.email/mailbox/*
// @include https://tmail.o22.in/mailbox/*
// @include https://tempos.email/*
// @include https://email.bi/mailbox/*
// ==/UserScript==

// Read https://codecanyon.net/item/tmail-multi-domain-temporary-email-system/20177819 for more info about the engine itself
// https://t-mail.org/ looks similar, but it seems uses other REST API

"use strict";


var e = null;

function getSiteBaseUrl(){
	let u = new URL(window.location.href);
	u.pathname = "";
	u.search="";
	return u.href;
}
const siteBaseUrl = getSiteBaseUrl();

{
	const fetchURI = siteBaseUrl + "/mail/fetch";
	const mailboxBase = siteBaseUrl + "/mailbox/";
	
	class Email {
		constructor(s) {
			this.getInbox(true)
		}
		getInbox(neW=false) {
			let uri = fetchURI;
			if(neW){
				uri += "?new=true"
			}
			return fetch(uri, {method: "GET"}).then(r => r.json());
		}
		forget() {
			return fetch(mailboxBase + "delete", {method: "POST"}).then(r => r.json());
		}

	}

	e = new Email(window.localStorage);
}

var emailsW = document.getElementById("mails");
var emptyContainer = document.getElementsByClassName("mail-empty")[0];

var counter = 0;

function refresh(evt) {
	console.log("Requesting refresh ...");
	e.getInbox().then(emails => {
		console.log("Got results", emails);
		for (let e of emails.slice(counter)) {
			let mailDiv = document.createElement("div");
			mailDiv.className = "mail-details";
			let titleDiv = document.createElement("div");
			titleDiv.className = "info";
			titleDiv.textContent = e["subject"];
			mailDiv.appendChild(titleDiv);

			let timeEl = document.createElement("time");
			timeEl.textContent = e["date"];
			mailDiv.appendChild(timeEl);

			let fromDiv = document.createElement("div");
			fromDiv.className = "sender";
			fromDiv.textContent =
				mailDiv.appendChild(fromDiv);

			let fromLabel = document.createElement("label");
			fromLabel.textContent = "From:";
			fromDiv.appendChild(fromLabel);

			let fromNameSpan = document.createElement("span");
			fromNameSpan.textContent = e["fromName"];
			fromDiv.appendChild(fromNameSpan);

			fromDiv.appendChild(document.createTextNode("<"));

			let fromEmailSpan = document.createElement("span");
			fromEmailSpan.textContent = e["fromEmail"];
			fromDiv.appendChild(fromEmailSpan);

			fromDiv.appendChild(document.createTextNode(">"));

			let bodyDiv = document.createElement("div");
			mailDiv.appendChild(bodyDiv);
			bodyDiv.innerHTML = r["bodyHtml"];

			emailsW.appendChild(mailDiv);
			counter += 1;
		}
	});
};

var copyBtn = document.getElementsByClassName("copy")[0];

var refreshBtn = document.getElementsByClassName("refresh")[0];
refreshBtn.addEventListener("click", refresh, false);
refresh();
