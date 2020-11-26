const cfParamsRx = /\s*\(\s*function\s*\(\)\s*\{\s*window\s*\[\s*(["'])__CF\$cv\$params\1\s*\]\s*=\s*\{\s*([^}]+)\s*\}\s*\}\s*\)\s*\(\s*\)\s*/i;

const stringRx = /(\w+)\s*:\s*('[^']+'|"[^"]+"),?/g;

const numberRxTextSrc = "(?:0x[\\da-f]+|\\d+)";
const numberArrayRxSrc = "(\\w+)\\s*:\\s*\\[((?:\\s*" + numberRxTextSrc + "\\s*,\\s*)+" + numberRxTextSrc + "?\\s*)\\]";
const numberArrayRx = new RegExp(numberArrayRxSrc);

function parseCloudFlareParams() {
	let res = [];

	for (let el of document.getElementsByTagName("SCRIPT")) {
		if (el.src) {
			continue;
		}
		let t = el.textContent;
		let m = t.match(cfParamsRx);

		if (m) {
			m = m[2];
			console.log(m);
			let thisScriptRes = new Map();
			m.replace(stringRx, (whole, k, v) => {
				v = JSON.parse(v.replace(/'/g, '"'));
				thisScriptRes.set(k, v);
				return "";
			});

			m.replace(numberArrayRx, (whole, k, v) => {
				v = v.split(",").map(v => parseInt(v.trim()));
				thisScriptRes.set(k, v);
				return "";
			});
			res.push(thisScriptRes);
		}
	}

	return res;
}
