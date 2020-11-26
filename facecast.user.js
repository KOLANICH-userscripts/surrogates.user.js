// ==UserScript==
// @name facecast_nojs_surrogate
// @description Allows to use facecast.net without their JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://facecast.net/v/*
// ==/UserScript==

"use strict";
let f = [...document.getElementsByTagName("script")].map(a => a.src).filter(a => !!a).filter(a => -1 < a.indexOf("player.min.js"))[0], m = /(\w*servers\w*)\s*=\s*(\[\s*(?:\{[^\}\]]+?\}\s*,\s*)*\{[^\}\]]+?\}\s*\])/ig;
fetch(f).then(a => {
	a.text().then(g => {
		g = g.match(m);
		let h = new Map;
		for (var e of g) {
			m.lastIndex = 0;
			let[, k, b] = m.exec(e);
			h.set(k, JSON.parse(b.replace(/([,\{])\s*(\w+):/g, '$1"$2":')))
		}
		console.log(h);
		e = window.location.pathname.split("/");
		let serverNo = -1;
		let servers = h.get("servers");
		function tryServer(l){
				return fetch("https://" + l.src + "/eventdata?init&code=" + e[e.length - 1] + "&ref=&sid=", {"mode": "cors"}).then(k => {
					k.json().then(b => {
						console.log(b);
						document.body.innerHTML = "";
						if(b.error){
							document.body.textContent = b.error;
							return;
						}
						let d = "https://" + l.src + "/public/" + b.id + ".m3u8";
						let c = document.createElement("H1");
						c.textContent = b.name;
						document.body.appendChild(c);
						c = document.createElement("A");
						c.href = d;
						c.textContent = d;
						document.body.appendChild(c);
						d = document.createElement("P");
						d.textContent = b.description;
						document.body.appendChild(d)
					})
				})
		};
		const timeout = 1000;
		const nextServer = () => {
			serverNo++;
			if(serverNo < servers.length){
				Promise.race([
					tryServer(servers[serverNo]),
					new Promise((resolve, reject) =>{setTimeout(reject, timeout)})
				]).catch(nextServer);
			}else{
				document.body.textContent = "All the servers have timed out";
			}
		};
		nextServer();
	})
});
