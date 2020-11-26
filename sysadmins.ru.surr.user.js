// ==UserScript==
// @name sysadmins_ru_decrypt_encrypted_text
// @description sysadmins.ru has some essential texts not present in their places when JS is disabled. It is not nice!
// @description:ru sysadmins.ru при отключённом JS не имеет самых важных текстов на своих местах. Это нехорошо!
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant GM.getResourceUrl
// @run-at document-idle
// @include /^https://sysadmins\.ru/(?:topic|forum)\d+.html/
// @require https://raw.githubusercontent.com/KOLANICH/WebCryptoJS.js/84fdfda1c50c9442b7559f3bd50aba3083d56ac5/WebCryptoJS_Unlicense.js
// @require https://raw.githubusercontent.com/KOLANICH/WebCryptoJS.js/84fdfda1c50c9442b7559f3bd50aba3083d56ac5/WebCryptoJS_MIT.js
// @require https://raw.githubusercontent.com/KOLANICH/WebCryptoJS.js/1721b32eb283bfdeee7ebaac0d468719462c71a7/spark_md5_bare.js
// @resource CryptoJS_MIT_license https://raw.githubusercontent.com/KOLANICH/WebCryptoJS.js/84fdfda1c50c9442b7559f3bd50aba3083d56ac5/licenses/CryptoJS_MIT.md
// ==/UserScript==

// WARNING: If you use ViolentMonkey, replace `GM.getResourceUrl` with `GM.getResourceURL` (https://github.com/violentmonkey/violentmonkey/issues/1403)

"use strict";
GM.getResourceUrl("CryptoJS_MIT_license").then(link => {
	console.info("WebCryptoJS_MIT is used, it's license is available by the link:", link)
});
const utf8Enc = new TextEncoder("utf-8"), utf8Dec = new TextDecoder("utf-8");
function decryptAndInsertMessage(cypherDict_salt, id, key) {
	let ciphertext = cjsBase64Decode(cypherDict_salt.ct),
	iv = cjsFromHex(cypherDict_salt.iv);
	cypherDict_salt = cjsFromHex(cypherDict_salt.s);
	key = new Uint8Array([...cjsTextParse(utf8Enc, key)]);  // A workaround for a bug in Firefox
	[iv, key] = cjsDeriveIVAndKeyFromPassword(EVPKDF.bind(null, md51_array, 1), 32, 16, key, cypherDict_salt);
	16 != iv.buffer.byteLength && console.error("iv.buffer.byteLength == " + iv.buffer.byteLength + " != 16, will be OperationError according to WebCrypto spec");
	return crypto.subtle.importKey("raw", key, "AES-CBC", !0, ["encrypt", "decrypt"]).then(importedKey => {
		window.crypto.subtle.decrypt({
			name: "AES-CBC",
			iv: iv
		}, importedKey, ciphertext.buffer).then(dec_decryptedMessage_decryptedMessageJSON => {
			dec_decryptedMessage_decryptedMessageJSON = utf8Dec.decode(dec_decryptedMessage_decryptedMessageJSON);
			dec_decryptedMessage_decryptedMessageJSON = JSON.parse(dec_decryptedMessage_decryptedMessageJSON);
			console.info("Message for", id, "is succesfully decrypted!");
			document.getElementById(id).innerHTML = dec_decryptedMessage_decryptedMessageJSON
		})
	})
}
function main() {
	let insertTextRx = /function\s+insertText\s*\(\)\s*\{([^]+)\}\s*insertText\(\);/m,
	textRx = /(?:let|var)\s+text\s*=\s*'([^']+?)';\s*(?:let|var)\s+id\s*=\s*'(\d+)';\s*(?:let|var)\s+topic\s*=\s*'([\w=]+)';/g,
	encryptedBlocksCount = 0, encryptedMessagesCount = 0;
	for (let el of[...document.getElementsByTagName("script")].filter(e => !e.src)) {
		var messagesEncryptedContentJS_res = insertTextRx.exec(el.innerHTML);
		if (messagesEncryptedContentJS_res) {
			messagesEncryptedContentJS_res = messagesEncryptedContentJS_res[1];
			let m;
			for (; m = textRx.exec(messagesEncryptedContentJS_res); ++encryptedMessagesCount){
				try {
					let [_, cyphertextObjJson, id, passDisguisedAsTopic] = m;
					decryptAndInsertMessage(JSON.parse(cyphertextObjJson), id, passDisguisedAsTopic.substr(0, 5));
				} catch (e) {
					console.error("Failed to decrypt message", e, messagesEncryptedContentJS_res)
				}
			}
			++encryptedBlocksCount
		}
	}
	console.info("Encrypted content detected: blocks: ", encryptedBlocksCount, "messages: ", encryptedMessagesCount)
}
main();
