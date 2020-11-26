// ==UserScript==
// @name proxysite_surrogate
// @description Allows you to use proxysite.com without their-supplied JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https://(www\.)?proxysite\.com\/?$/
// @include /^https://((us|eu)\d+)\.proxysite\.com\/process.php\?/
// ==/UserScript==

/*
A trend: incoming URL is usually (but not always!) differs outgoing domain by 2-3 in the last octet of IP address

us1 68.235.60.198 <- 68.235.60.195 Illinois, Cook, Chicago (Loop)
us2 68.235.60.205 <- 68.235.60.203 Illinois, Cook, Chicago (Loop)
us3 68.235.60.213 <- 68.235.60.211 Illinois, Cook, Chicago (Loop)
us4 68.235.60.221 <- 68.235.60.219 Illinois, Cook, Chicago (Loop)
us5 68.235.60.237 <- 68.235.60.235 Illinois, Cook, Chicago (Loop)
us7 68.235.61.38 <- 68.235.61.35 Illinois, Cook, Chicago (Loop)
us8 68.235.61.78 <- 68.235.61.75 Illinois, Cook, Chicago (Loop)
us9 68.235.61.86 <- 68.235.61.83 Illinois, Cook, Chicago (Loop)
us10 68.235.61.102 <- 68.235.61.99 Illinois, Cook, Chicago (Loop)
us11 167.114.11.52 <- 192.99.16.196 New Jersey, Essex, Newark (Central Ward)
us12 198.50.155.77 <- 167.114.210.76 New York

us13 54.39.48.111 <- 54.39.48.111 Quebec, Montérégie, Beauharnois
us14 167.114.175.21 <- 167.114.175.21 Quebec, Montérégie, Beauharnois
us15 68.235.52.123 <- 68.235.52.123 Illinois, Cook, Chicago (Loop)
us16 54.39.133.107 <- 54.39.133.107 Quebec, Montérégie, Beauharnois
us17 54.39.133.108 <- 54.39.133.108 Quebec, Montérégie, Beauharnois
us18 54.39.107.46 <- 54.39.107.46 Quebec, Montérégie, Beauharnois
us19 54.39.133.113 <- 54.39.133.113 Quebec, Montérégie, Beauharnois
us20 51.79.18.87 <- 51.79.18.87 Quebec, Montérégie, Beauharnois

eu1 217.182.175.63 <- 51.254.174.156 Hauts-de-France, Roubaix
eu2 145.239.165.168 <- 137.74.58.219 Île-de-France, Paris
eu3 217.182.175.74 <- 178.33.33.138 Hauts-de-France, Roubaix
eu4 217.182.175.75 <- 164.132.119.16 Hauts-de-France, Roubaix
eu5 217.182.175.122 <- 217.182.18.114 Hauts-de-France, Roubaix
eu6 188.165.65.182 <- 188.165.65.182 Germany, Saarland, Saarbrücken
eu7 5.135.136.191 <- 5.135.136.191 Hauts-de-France, Roubaix
eu8 176.31.227.198 <- 176.31.227.198 Hauts-de-France, Roubaix
eu9 178.33.239.186 <- 178.33.239.186 Hauts-de-France, Roubaix
eu10 46.105.118.55 <- 46.105.118.55 Hauts-de-France, Roubaix
eu11 51.91.247.50 <- 51.91.247.50 France, Marseille
eu12 164.132.162.219 <- 164.132.162.219 Hauts-de-France, Roubaix
eu13 141.94.1.96 <- 54.37.83.192 Hauts-de-France, Roubaix
eu14 164.132.163.139 <- 164.132.163.139 Hauts-de-France, Roubaix
eu15 51.178.130.44 <- 51.178.130.44 Hauts-de-France, Roubaix
eu16 147.135.255.104 <- 147.135.255.104 Hauts-de-France, Gravelines
eu17 147.135.255.111 <- 147.135.255.111 Hauts-de-France, Gravelines
eu18 147.135.255.195 <- 147.135.255.195 Hauts-de-France, Gravelines
*/

"use strict";
const serverSelectorEl = document.getElementsByClassName('server-option')[0];
const formEl = document.getElementsByClassName('url-form')[0];
const secondLvlDomain = (() => {
	const domainSplit = window.location.hostname.split('.');
	return domainSplit.slice(domainSplit.length - 2, domainSplit.length).join('.');
})();

function fixUrlFormAction() {
	let u = new URL(formEl.action);
	u.hostname = serverSelectorEl.value + '.' + secondLvlDomain;
	formEl.action = u.href;
}
fixUrlFormAction();
serverSelectorEl.addEventListener('change', fixUrlFormAction, false);

var ginfRe = /^\s*ginf\s*=\s*\{/;

function getGinfElement() {
	for (let el of document.querySelectorAll("script[type='text/javascript']:not(:empty):not([src])")) {
		if (ginfRe.exec(el.textContent)) {
			return el;
		}
	}
}
ginfText = getGinfElement().textContent;

var ginfTextTransformRe = /([,\{])\s*(\w+\b)\s*:/g;

function ginfTextToJSON(ginfText) {
	ginfText = ginfText.replace(ginfRe, "{");
	ginfText = ginfText.replace(ginfTextTransformRe, (whole, preceeding, name, ...rest) => {
		console.info(whole, name, rest);
		return preceeding + '"' + name + '":';
	});
	ginfText = ginfText.replace(/'/g, '"');
	return ginfText;
}

function getGinf(ginfText) {
	return JSON.parse(ginfTextToJSON(ginfText));
}
var ginf = getGinf(ginfText);

function rc4(key, str) {
	// public domain, taken from https://gist.githubusercontent.com/salipro4ever/e234addf92eb80f1858f/raw/b290c2dcc0eef9c23015eab0bb335f08bee0e862/rc4.js
	var s = [],
		j = 0,
		x, res = '';
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < str.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return res;
}

function decryptURIText(uriTextEnc) {
	return rc4(ginf["enc"]["u"], atob(uriTextEnc));
}

function encryptURIText(uriText) {
	return btoa(rc4(ginf["enc"]["u"], uriText));
}

// add &f=norefer to src to get the content
//decryptURIText(decodeURIComponent(/*d arg */))
