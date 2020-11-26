// ==UserScript==
// @name OpenNet.ru_surogate
// @description Allows to unfold comments and vote on OpenNet.ru
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /https:\/\/(www\.)?opennet\.ru\/.+/
// ==/UserScript==
"use strict";

function getBaseUriStr() {
	const u = new URL(document.querySelector("form[method=post]").action);
	const pn = u.pathname.split("/");
	pn[pn.length - 1] = "ajax2.cgi";
	u.pathname = pn.join("/");
	const apiAddr = u.href;
	pn[pn.length - 1] = "vsluhboard.cgi";
	u.pathname = pn.join("/");
	const forumAddr = u.href;
	return [apiAddr, forumAddr].map(e => e + "?");
}

const [apiAddr, forumAddr] = getBaseUriStr();

function getRespondURI(om, omm, forum) {
	return forumAddr + (new URLSearchParams([
		["az", "post"],
		["om", om],
		["forum", "vsluhforumID3"],
		["omm", omm],
		//["news_key", news_key],
	]));
}

function getViewURI(om, omm, forum) {
	return forumAddr + (new URLSearchParams([
		["az", "show_thread"],
		["om", om],
		["forum", "vsluhforumID3"],
		["omm", omm],
	]));
}

function getVoteURI(id, delta) {
	return apiAddr + (new URLSearchParams([
		["rs", "vote"],
		["id", id],
		["vote", delta]
	]));
}

function getHiddenThreadURI(om, omm, forum) {
	return apiAddr + (new URLSearchParams([
		["rs", "get_thread"],
		["rsargs", om],
		["rsargs", omm],
		["rsargs", forum],
	]));
}

function vote(id, delta) {
	alert("voting...");
	return fetch(getVoteURI(id, delta)).then(r => r.text())
	//OK FORUM {id}=1
	//ERR1 {id}=2
}


function getHiddenThread(om, omm, forum) {
	return fetch(getHiddenThreadURI(om, omm, forum)).then(r => r.blob()).then(b => b.arrayBuffer()).then(b => {
		const dec = new TextDecoder(document.charset);
		const t = dec.decode(b);
		const status = t.substring(0, 2);
		const text = t.substring(2);
		return [status, text];
	});
}

function votingLinkClickProcessor(evt) {
	const spanEl = evt.target
	const linkEl = spanEl.parentElement;
	const containerEl = linkEl.parentElement;
	const voteId = containerEl.id.substring(3);
	const cn = spanEl.className;
	vote(voteId, (cn.substring(cn.length - 2) == "p" ? 1 : -1)).then(t => alert(t));
}

function setupVoting() {
	[...document.getElementsByClassName("vt_d"), ...document.getElementsByClassName("vt_d2")].forEach((el) => {
		const id = el.id;
		if (id.substring(0, 3) == "vt_") {
			for (const cls of ["vt_p", "vt_m"]) {
				el.getElementsByClassName(cls)[0].addEventListener("click", votingLinkClickProcessor, true);
			}
		}
	});
}

setupVoting();

const showThreadCallRx = /do_show_thread0\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*;.*/;

function parseExpansionParams(el) {
	const oc = el.getAttribute("onclick");
	const m = showThreadCallRx.exec(oc);
	if (m) {
		const args = m.slice(1);
		return args;
	}
}

function expandLinkClickProcessor(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	const el = evt.target
	const args = JSON.parse(el.dataset["args"]);
	if (args) {
		getHiddenThread(...args).then(([status, text]) => {
			const cells = el.parentElement.parentElement.parentElement.parentElement.getElementsByTagName("td");
			const textEl = cells[cells.length - 1];
			textEl.innerHTML = text;
			el.removeEventListener("click", expandLinkClickProcessor, true);
			el.href = getRespondURI(...args);
			el.textContent = "[ответ]";
		});
	}
}


function setupExpansion() {
	[...document.querySelectorAll("a[onclick]")].filter(e => e.getAttribute("onclick").indexOf("do_show_thread0") == 0).forEach(el => {
		const args = parseExpansionParams(el);
		el.dataset["args"] = JSON.stringify(args);
		el.href = getViewURI(...args);
		el.addEventListener("click", expandLinkClickProcessor, true);
	});
}
setupExpansion();
