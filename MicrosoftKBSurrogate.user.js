// ==UserScript==
// @name microsoft_kb_surrogate
// @description Allows to use M$ knowledge base pages without M$-shipped JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https?://support.microsoft.com/(\w{2}-\w{2,3}/help|kb)/\d+(/.+)?$/
// ==/UserScript==

"use strict";
let ce = document.createElement.bind(document);
let r = /microsoft\.support\.prefetchedArticle\s*=\s*\(\s*function\s*\(\s*\)\s*\{\s*return\s+([^]+?)\}\)\(\);/m;
let x = /'([a-z]{2}(?:-[a-z]{2})?\/\d+)'/g;

let t;
for (let w of document.getElementsByTagName('SCRIPT')) {
	if (!w.src) {
		let m = w.textContent.match(r);
		if (m) {
			t = m[1].replace(x, '"$1"');
			break;
		}
	}
}
let j = JSON.parse(t), M = document.getElementById('mainContent');
function A(a, b) {
	a = new Date(a);
	var g = ce('time'),
	n = ce('p');
	n.textContent = b;
	g.a = a;
	g.textContent = a;
	n.appendChild(g);
	M.appendChild(n);
}
M.innerHTML = "";
for (let B in j) {
	var d = j[B].details, h = ce('h1');
	document.head.title = h.textContent = 'KB' + d.id + ' - ' + d.heading;
	M.appendChild(h);
	A(d.createdOn, 'created: ');
	A(d.publishedOn, 'published: ');
	var s = ce('section');
	s.textContent = d.description;
	M.appendChild(s);
	for (var body of d.body) {
		let S = ce('section'),
		J = ce('h3');
		J.textContent = body.title;
		S.appendChild(J);
		var P = ce('p');
		P.innerHTML = body.content;
		S.appendChild(P);
		M.appendChild(S)
		//body["meta"]
	}
	var a = ce('a');
	a.textContent = 'Download JSON';
	a.download = 'KB' + d.id + '.json';
	a.href = URL.createObjectURL(new Blob([JSON.stringify(j, null, '\t')], {type : 'application/json'}));
	a.style.color = 'blue';
	M.appendChild(a);
	break;
}
