// ==UserScript==
// @name yandex_disk_surrogate
// @description Allows to download from Yandex Disk without Yandex-shipped JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @run-at document-idle
// @include /^https://(yadi\.sk|disk\.yandex\.ru)/[id]/\w{13,}$/
// @grant GM.xmlHttpRequest
// ==/UserScript==


const jsonURI = 'https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=' + window.location.href;

const buttons = [...document.getElementsByClassName("download-button")];
if (buttons.length) {
	buttons = buttons.map((b) => {
		a = document.createElement("A");
		a.href = jsonURI;
		b.parentElement.replaceChild(a, b);
		a.appendChild(b);
	});
	try {
		GM.xmlHttpRequest({
			method: "GET",
			url: jsonURI,
			onload: function(response) {
				const rj = JSON.parse(response.responseText);
				const clickProc = (evt) => {
					document.write(JSON.stringify(rj, null, "\t"));
				};
				buttons.forEach((b) => {
					b.href = rj["href"];
					b.addEventListener("click", clickProc, false);
				});
			}
		});
	} catch {

	}
} else {
	window.location.href = jsonURI;
}
