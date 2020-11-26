// ==UserScript==
// @name yandex_disk_surrogate
// @description Allows to download from Yandex Disk without Yandex-shipped JS.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match /^https://yadi\.sk/d/\w{13}$/
// ==/UserScript==

window.location.href = 'https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=' + window.location.href;
