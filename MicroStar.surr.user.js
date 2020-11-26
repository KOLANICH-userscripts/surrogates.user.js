// ==UserScript==
// @name microstar_downloads_surrogate
// @description Allows you to browse MicroStar websites without any JS loaded from the website.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @include /^https://(\w{2}|www)\.msi\.com/.+/
// ==/UserScript==

"use strict";

let pns = window.location.pathname.split("/");
if (pns.length) {
	while (pns.length && !pns[0].length) {
		pns = pns.slice(1, pns.length);
	}
}

function genURIArrayParam(paramName, arr) {
	return arr.map((el) => paramName + "[]=" + arrEl).join("&");
}

function getCleanedUpBaseName(){
	let a = document.createElement("A");
	a.href = document.location.href;
	a.pathname = ""
	a.hash = "";
	return a.href;
}

const cubn = getCleanedUpBaseName();
const API_BASE_V1 = cubn + "api/v1/";
const PRODUCT_API_BASE = API_BASE_V1 + "product/";
const defaultItemsPerPage = 12; // 32 is OK too


class MSIAPI {
	static _f(uri) {
		return fetch(uri, {
			"method": "POST",
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				"X-Requested-With": "XMLHttpRequest",
			}
		});
	}
	static f(uri) {
		return this._f(uri).then(r => r.json());
	}
	static ft(uri) {
		return this._f(uri).then(r => r.text());
	}
	static compareProducts(langCode, compares) {
		return this.f(API_BASE_V1 + "compare?country_code=" + langCode + "&" + genURIArrayParam("products", compares.map(atob)));
	}

	static getFeaturedProducts(productLineAbbreviation = defaultProductLineAbbreviation, page = 1, itemsPerPage = defaultItemsPerPage, sortOrder = null) {
		return this.f(PRODUCT_API_BASE + "getHotProductList?product_line=" + productLineAbbreviation + "&page_number=" + page + "&page_size=" + itemsPerPage + "&sort=" + sortOrder);
	}

	static getProducts(productLineAbbreviation = defaultProductLineAbbreviation, page = 1, itemsPerPage = defaultItemsPerPage, sortOrder = null, filters = null) {
		return this.f(PRODUCT_API_BASE + "getProductList?" + (productLineAbbreviation ? ("product_line=" + productLineAbbreviation + "&") : "") + "page_number=" + page + "&page_size=" + itemsPerPage + (sortOrder ? "&sort=" + sortOrder : "") + (filters ? ("&" + genURIArrayParam("id", filters)) : ""));
	}

	static getProductsTags(productLineAbbreviation = defaultProductLineAbbreviation) {
		return this.f(PRODUCT_API_BASE + "getProductTagList?product_line=" + productLineAbbreviation + "&" + genURIArrayParam("id", models));
	}

	static getProductsNews(productLineAbbreviation = defaultProductLineAbbreviation) {
		return this.f(PRODUCT_API_BASE + "getProductNewsList?product_line=" + productLineAbbreviation);
	}

	static getProductsVideos(productLineAbbreviation = defaultProductLineAbbreviation) {
		return this.f(PRODUCT_API_BASE + "getProductVideoList?product_line=" + productLineAbbreviation);
	}

	static getProductsIcons(productLineAbbreviation = defaultProductLineAbbreviation) {
		return this.f(PRODUCT_API_BASE + "getProductIconList?product_line=" + productLineAbbreviation);
	}

	static getFilters(productLineAbbreviation = defaultProductLineAbbreviation, models) {
		return this.f(PRODUCT_API_BASE + "getEnableFilters?product_line=" + productLineAbbreviation + "&" + genURIArrayParam("id", models));
	}

	static getSupportDownloads(csrf, langCode, tp, pid, productLineAbbreviation = defaultProductLineAbbreviation) {
		return fetch(cubn + "/product_ajax/get_support_item", {
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				"X-Requested-With": "XMLHttpRequest",
			},
			"body": "support_type=download&type=" + tp + "&product_id=" + pid + "&category=" + productLineAbbreviation + "&_token=" + csrf + "&country_code=" + langCode + "&preview=1",
			"method": "POST",
			"mode": "no-cors"
		}).then(e => e.text());
	}
};

const defaultProductLineAbbreviation = "mb";

if (pns[1] == "support") {
	let csrf = document.querySelectorAll("meta[name=csrf-token]")[0].content;
	let langCode = window.location.hostname.split(".")[0];

	if (langCode == "www") {
		langCode = "global";
	}

	var mainBlock = document.getElementById("support-main-block-download");
	var contentContainer = document.getElementById("download_block");

	var cache = new Map();

	var ss = [...document.getElementsByTagName("SCRIPT")];
	var rx = /product_id\s*:\s*(\d+)/;
	var pid = null;
	for (let el of ss) {
		if (!el.textContent) {
			continue;
		}
		let m = rx.exec(el.textContent);
		if (m) {
			try {
				pid = parseInt(m[1]);
			} catch (err) {
				console.error(err);
			}
		}
		console.log(m);
	}
	if (!pid) {
		console.error("Product id has not been detected");
	}

	function tabClickListener(evt) {
		let tp = evt.target.dataset["type"];
		console.log(evt, evt.target, tp);
		if (cache.has(tp)) {
			contentContainer.innerHTML = cache.get(tp);
		} else {
			MSIAPI.getSupportDownloads(csrf, langCode, tp, pid, defaultProductLineAbbreviation).then((t) => {
				cache.set(tp, t)
				contentContainer.innerHTML = t;
			});
		}
		for (var el of contentContainer.getElementsByClassName("collapse")) {
			el.classList.remove("collapse");
			for (var ell of el.getElementsByClassName("download-box-one-div")) {
				ell.style.display = "block";
			}
		}
	}

	for (let tab of mainBlock.getElementsByClassName("download-type-tab")) {
		tab.addEventListener("click", tabClickListener, false);
	}
} else if (!pns.length) {
	var mainEl = document.getElementsByClassName("msiMain")[0];
	console.log(mainEl);
	mainEl.innerHTML = "";

	function T(own, whole) {
		return document.createTextNode(own)
	};
	var preferredProductPage = "support";

	MSIAPI.getProducts(defaultProductLineAbbreviation).then(psRes => {
		let ps = psRes["result"]["getProductList"];
		let t = document.createElement("TABLE");
		let thd = document.createElement("THEAD");
		t.appendChild(thd);
		let remap = {
			"id": ["ID", T],
			"ean": ["ean", T],
			"title": ["Title", (own, whole) => {
				let a = document.createElement("A");
				a.href = "/" + whole["product_line"] + "/" + preferredProductPage + "/" + whole["link"];
				a.textContent = own;
				if(whole["subname"]){
					let s = document.createElement("STRONG");
					s.textContent = whole["subname"];
					a.appendChild(s);
				}
				return a;
			}],
			"picture": ["Picture", (own, whole) => {
				let r = new Image();
				r.src = own;
				r.style.width = r.style.height = "5em";
				return r;
			}],
			"release": ["Release Date", (own, whole) => {
				let t = document.createElement("TIME");
				t.textContent = own;
				return t;
			}],
			"desc": ["Description", T],
		};
		let b = document.createElement("TBODY");
		t.appendChild(b);
		mainEl.appendChild(t);

		for (let d of Object.values(remap)) {
			let th = document.createElement("TH");
			th.textContent = d[0];
			thd.appendChild(th);
		}

		for (let p of ps) {
			let r = document.createElement("TR");
			for (let [k, d] of Object.entries(remap)) {
				let td = document.createElement("TD");
				td.appendChild(d[1](p[k], p));
				r.appendChild(td);
			}
			if(p["label"] == "HOT"){
				p.style.borderColor = "red";
			}
			b.appendChild(r);
		}
	});

} else {
	console.warn("Surrogate is not implemented for the page", window.location);
}
