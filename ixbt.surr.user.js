// ==UserScript==
// @name ixbt_insert_text
// @description ixbt internet forum intentionally makes it impossible to use the website without JS by inlining messages into it. It is not nice!
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^(?:https:\/\/web\.archive\.org\/web\/\d+\/)?https?:\/\/forum\.ixbt\.com\/(?<page>topic\.cgi)?\?id=(?<id>\d+(?::\d+)?)/
// ==/UserScript==

"use strict";
let componentsMapping = new Map([
	["1", "status"],
	["3", "answers_stats"],
	["a", "avatar"],
	["2", "country"],
	["c", "city"],
	["4", "registration_date"],
	["5", "homepage"],
	["6", "warned_times"],
	["7", "photo"],
	["9", "topic_relation"],
	["0", "is_registered"],
	["i", "icon"],
	["t", "karma"],
	["o", "currently_online"]
]), userTopicRelations = new Map([
	["1", "premium"],
	["2", "author"],
	["3", "curator"]
]);
function parseMessageInfo(messageInfo, customSerializedMsgInfo_type) {
	let unrecMessageInfo = new Map;
	for (let comp of customSerializedMsgInfo_type.split("||"))
		if (comp) {
			customSerializedMsgInfo_type = comp.slice(0, 1);
			let val = comp.slice(1);
			componentsMapping.has(customSerializedMsgInfo_type) ? messageInfo[componentsMapping.get(customSerializedMsgInfo_type)] = val : unrecMessageInfo.set(customSerializedMsgInfo_type, val)
		}
	return unrecMessageInfo
}
function getUserURI(nickname) {
	return "/users.cgi?id=info:" + nickname
}
function getUserLink(nickname) {
	let userLink = document.createElement("A");
	userLink.innerHTML = nickname;
	console.log(userLink, userLink.textContent);
	userLink.href = getUserURI(userLink.textContent.trim());
	return userLink
}
function getTopicURI(forumId, topicId) {
	return "/topic.cgi?id=" + forumId + ":" + topicId
}
function getTopicLink(title, forumId, topicId) {
	let topic = document.createElement("A");
	topic.href = getTopicURI(forumId, topicId);
	topic.innerHTML = title;
	return topic
}
function processTopic() {
	console.log("processTopic");
	const postScriptRx = /t_post\((?<messageNoOnPage>\d+)\s*,\s*'(?<userIdentityInfo>[^']+)'\s*,\s*'(?<customSerializedMsgInfo>(?:\d.+?\|\|)+)'\s*,(?<timestamp>\d+),\s*(?:'(?<msgHTML1>((?:[^']|\\')+?))'|"(?<msgHTML2>((?:[^"]|\\")+?))")\s*,\s*\[\](\s*,\s*'(?<thanks>[^']+)')?\)/u;
	for (let s of[...document.body.getElementsByTagName("script")].filter(e => !e.src)) {
		let m = postScriptRx.exec(s.textContent);
		if (m) {
			let closing_d_msgInfo,
			authorNicknameLink_ava_bodyEl_nickname,
			authorD_userIdentityInfo = m.groups.userIdentityInfo;
			"(" == authorD_userIdentityInfo.substr(0, 1) ? (closing_d_msgInfo = authorD_userIdentityInfo.indexOf(")"), authorNicknameLink_ava_bodyEl_nickname = authorD_userIdentityInfo.substr(closing_d_msgInfo + 1)) : authorNicknameLink_ava_bodyEl_nickname = authorD_userIdentityInfo;
			closing_d_msgInfo = {
				messageNoOnPage: m.groups.messageNoOnPage,
				timestamp: m.groups.timestamp
			};
			parseMessageInfo(closing_d_msgInfo, m.groups.customSerializedMsgInfo);
			authorD_userIdentityInfo = document.createElement("div");
			authorNicknameLink_ava_bodyEl_nickname = getUserLink(authorNicknameLink_ava_bodyEl_nickname);
			authorD_userIdentityInfo.appendChild(authorNicknameLink_ava_bodyEl_nickname);
			closing_d_msgInfo.topic_relation && userTopicRelations.has(closing_d_msgInfo.topic_relation) && (authorNicknameLink_ava_bodyEl_nickname.className += userTopicRelations.get(closing_d_msgInfo.topic_relation));
			closing_d_msgInfo.avatar && (authorNicknameLink_ava_bodyEl_nickname = new Image, authorNicknameLink_ava_bodyEl_nickname.src = "/avatars/" + closing_d_msgInfo.avatar, authorNicknameLink_ava_bodyEl_nickname.className = "tavatar", authorD_userIdentityInfo.appendChild(authorNicknameLink_ava_bodyEl_nickname));
			document.createElement("div").textContent = JSON.stringify(closing_d_msgInfo);
			closing_d_msgInfo = document.createElement("div");
			closing_d_msgInfo.className = "message";
			closing_d_msgInfo.innerHTML = m.groups.msgHTML1 ? m.groups.msgHTML1 : m.groups.msgHTML2;
			console.log(closing_d_msgInfo.getElementsByClassName("spoiler-wrap"));
			for (let spoilerEl of[...closing_d_msgInfo.getElementsByClassName("spoiler-wrap")]) {
				authorNicknameLink_ava_bodyEl_nickname = spoilerEl.getElementsByClassName("spoiler-body")[0];
				var headEl_thanksLabel = spoilerEl.getElementsByClassName("spoiler-head")[0];
				console.log("Fixing spoiler", spoilerEl);
				let dets = document.createElement("DETAILS"),
				summ = document.createElement("SUMMARY");
				summ.innerHTML = headEl_thanksLabel.innerHTML;
				summ.className = headEl_thanksLabel.className;
				dets.className = spoilerEl.className;
				dets.appendChild(summ);
				dets.appendChild(authorNicknameLink_ava_bodyEl_nickname);
				authorNicknameLink_ava_bodyEl_nickname.style.display = "";
				spoilerEl.parentElement.replaceChild(dets, spoilerEl)
			}
			if (m.groups.thanks) {
				authorNicknameLink_ava_bodyEl_nickname = document.createElement("DIV");
				authorNicknameLink_ava_bodyEl_nickname.className = "thank";
				headEl_thanksLabel = document.createElement("span");
				headEl_thanksLabel.textContent = "Благодарны:";
				authorNicknameLink_ava_bodyEl_nickname.appendChild(headEl_thanksLabel);
				for (let thankedUser of m.groups.thanks.split(";"))
					authorNicknameLink_ava_bodyEl_nickname.appendChild(getUserLink(thankedUser)), authorNicknameLink_ava_bodyEl_nickname.appendChild(document.createTextNode(", "));
				closing_d_msgInfo.appendChild(authorNicknameLink_ava_bodyEl_nickname)
			}
			closing_d_msgInfo.insertBefore(authorD_userIdentityInfo, closing_d_msgInfo.firstChild);
			s.parentElement.replaceChild(closing_d_msgInfo, s)
		}
	}
}
function regexpFromLiteralSrc(litSrc) {
	let lastSlash = litSrc.lastIndexOf("/"),
	flags = litSrc.substring(lastSlash + 1);
	litSrc = litSrc.substring(1, lastSlash).replace("\\/", "/");
	return new RegExp(litSrc, flags)
}
function timestamp2ReadableDate(ts) {
	return (new Date(parseInt(1E3 * ts))).toLocaleDateString("ru")
}

function processSubForum() {
	console.log("this is a (sub)forum");
	const topicRegex = /f_tr\((?<forumId>\d+)\s*,\s*(?<topicId>\d+)\s*,\s*'(?<tagsAndSomeShit>\w+)'\s*,\s*(?<icon>\d+)\s*,\s*(?<pageCount>\d+)\s*,\s*'(?<topicTitle>[^']+)'\s*,\s*(?<someInteger>\d+)\s*,\s*(?<visitsCount>\d+)\s*,\s*'(?<lifetime>[^']*)'\s*,\s*'(?<authorNickname>[^']+)'\s*,\s*(?<createdTs>\d+)\s*,\s*'(?<lastAnswererNickName>[^']+)'\s*,\s*(?<modifiedTs>\d+)\s*,\s*'(?<topicTag2>)'\)/mg;
	for (let scriptEl of[...document.getElementsByTagName("script")].filter(e => !e.src)) {
		let m = topicRegex.exec(scriptEl.textContent);
		if (m) {
			let topicsTable = scriptEl.parentElement,
			r = document.createElement("THEAD"),
			tbody = document.createElement("TBODY"),
			columns = "icon topic author created visitsCount pageCount modified lastAnswerer".split(" "),
			c;
			for (let name of columns)
				c = document.createElement("TH"), c.textContent = name, r.appendChild(c);
			for (topicsTable.insertBefore(r, scriptEl); m; m = topicRegex.exec(scriptEl.textContent)) {
				m = m.groups;
				console.log(m);
				m.author = getUserLink(m.authorNickname);
				m.topic = getTopicLink(m.topicTitle, m.forumId, m.topicId);
				m.lastAnswerer = getUserLink(m.lastAnswererNickName);
				m.created = timestamp2ReadableDate(m.createdTs);
				m.modified = timestamp2ReadableDate(m.modifiedTs);
				
				r = document.createElement("tr");
				for (let name of columns) {
					c = document.createElement("td");
					let v = m[name];
					"string" == typeof v ? c.innerHTML = v : c.appendChild(v);
					r.appendChild(c)
				}
				tbody.appendChild(r)
			}
			topicsTable.replaceChild(tbody, scriptEl)
		}
	}
}

const pageRegExp = regexpFromLiteralSrc(GM.info.script.includes[0]);
function main() {
	let m = pageRegExp.exec(window.location.href);
	if(m){
		let st = document.createElement("style");
		st.textContent = "#top_menu a.top {display: block;} .message {border: solid brown 1px; margin: 1%;} .thank {border: solid green 1px;}";
		document.head.appendChild(st);
		switch (m.groups.page) {
			case "topic.cgi":
				processTopic();
			break;
			case void 0:
				processSubForum()
			break;
		}
	} else {
		console.warn("This page doesn't match the regexp");
	}
}

main();
