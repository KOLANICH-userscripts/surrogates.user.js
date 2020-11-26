// ==UserScript==
// @name microsoft_vs_download_surrogate
// @description Allows to download Visual Studio without M$-shipped JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https://(?:(www\.)?visualstudio\.com|visualstudio.microsoft.com)/thank-you-downloading-[\w-]+/.+$/
// ==/UserScript==

'use strict';
let d = /var\s+downloadResult\s*=\s*(\{[^]+\})\s*;/m, e = /(\w+)(\s*:(?!\/\/))/g;
for (let f of document.getElementsByTagName('script')){
	try {
		let a = d.exec(f.innerHTML);
		if (a) {
			let b = a[1].replace(/'/g, '"');
			b = b.replace(e, '"$1"$2');
			let c = JSON.parse(b);
			if (c.downloadUrl) {
				window.location.href = c.downloadUrl;
				break
			}
		}
	} catch (a) {};
}
