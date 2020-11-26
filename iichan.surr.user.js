// ==UserScript==
// @name iichan_surrogate
// @description Unbreaks posting on iichan
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include https://iichan.hk/*
// ==/UserScript==
"use strict";

const mySecret = "";

function b64Buf(buf) {
	return btoa([...buf].map(el => String.fromCharCode(el)).join(""))
}
const b64OverheadInv = 3 / 4;

function genRandomPass(length) {
	const c = new Uint8Array(length * b64OverheadInv);
	window.crypto.getRandomValues(c);
	return b64Buf(c)
}

function derivePassFromThread(postId, mySecret) {
	const u8e = new TextEncoder("utf-8");
	return window.crypto.subtle.digest("SHA-1", u8e.encode(postId + '|' + mySecret)).then(b => {
		return b64Buf(new Uint8Array(b));
	});
}

async function getPass(password, postForm) {
	if (password.value) {
		password = password.value
	} else {
		if (mySecret.length) {
			const parent = postForm.querySelector("input[name=parent]");
			password = await derivePassFromThread(parent ? parent.value : "", mySecret);
		} else {
			password = genRandomPass(6);
		}
	}
	return password
}

function initializePassword(postForm) {
	const password = postForm.querySelector("input[name=password]");
	const delPasEl = document.getElementsByClassName("userdelete")[0].querySelector("input[name=password]");
	getPass(password, postForm).then(pass => {
		password.value = delPasEl.value = pass;
	});
	password.type = delPasEl.type = "text";
}

function updateCaptcha(captchaImg, src) {
	fetch(src, {
		cache: "reload",
		mode: "no-cors"
	}).then(res => res.blob()).then(blb => {
		captchaImg.src = URL.createObjectURL(blb)
	})
}

function setupCaptchaReload() {
	const captchaImg = document.querySelector("img#captcha"),
		p = captchaImg.parentElement;
	p.parentElement.replaceChild(captchaImg, p);
	const captchURI = captchaImg.src;
	captchaImg.addEventListener("click", evt => updateCaptcha(evt.target, captchURI), !1)
}

function main() {
	const postForm = document.getElementById("postform");
	initializePassword(postForm);
	setupCaptchaReload();
}

main();
