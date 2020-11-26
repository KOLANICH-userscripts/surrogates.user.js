Surrogates user.js
==================

Some websites were made unusable without JS. Often intentionally, as a mean to coerce a user into allowing the website to use JavaScript - a dangerous remote code execution technology abused in the current Web in order to fingerprint users, track their behavior and detect ad-blockers in order to deny them service and capable to be used to exploit hardware (including microarchitectural) and driver vulnerabilities.

NoScript browser extension used to contain a feature called "surrogates", which allowed users to use some websites written the way that without JavaScript the website cannot operate. The solution was to bring an own small and easy-to-audit piece of JavaScript, that allows a website to operate, just without any JS-implemented unapproved, unexpected or malicious functionality, that the website could have.

When NoScript has migrated from Firefox XPCOM to WebExtensions, this functionality hasn't been ported, though the surrogates are [still available in its repo](https://github.com/hackademix/noscript/blob/master/src/legacy/defaults.js#L206L302) (and [here is a PR](https://github.com/hackademix/noscript/pull/12)) with some of my ones).

μBlock also contains something [like that, called "scriptlet", but more limited (no conditional inclusion based on noscript state)](https://github.com/gorhill/uBlock/wiki/Static-filter-syntax#scriptlet-injection). [Here are their scriptlets](https://github.com/gorhill/uBlock/blob/master/assets/resources/scriptlets.js). The good part of their scriptlets is that they have general-purpose scriptlets.

Of course it really makes no sense to implement this functionality in NoScript itself. There are browser extensions of the cathegory of **userscripts managers**, which purpose is executing client-stored scripts on webpages. Ideally they should have some interface allowing other browser extensions to control their behavior using their public API. See [this](https://github.com/open-source-ideas/open-source-ideas/issues/60) and [this](https://github.com/hackademix/noscript/issues/10) for more info about the idea and  [a script that may be helpful](https://github.com/hackademix/noscript/blob/884b6ee146a49682774c806458a8fbf9e0977890/src/surrogates/convert.py). But it is not yet implemented. It is a task for future.

For now our task is to restore surrogate support. The most straightforward way is to just utilize existing userscripts managers.

This repo contains some "surrogates" in a form of `*.user.js` scripts.

Here are surrogates for some websites having major flaws in compatibility with the browsers with disabled JS:

Can be benign
-------------

* [facecast.net](./facecast.user.js) - A video streaming service. Uses HLS. To get the HLS streams some requests have to be done. And some measurement of user's speed and a ping to select the optimal server for the minimal latency. Currently the surrogate just chooses the first server in the list that have responded within a timeout of 1 second. The surrogate gives you the links you can paste into any player supporting HLS.
* [Bing (bing.com)](./bing.user.js) - Bing returns empty results, unless some cookies are set. It seems that the issue is present only for some users. Other users report that for them everything works fine.
* [support.microsoft.com](./MicrosoftKBSurrogate.user.js) - Rendering of some knowledge base pages is done using JS from JSON representation on client side. I see no legit reason not to render that server side.
* [visualstudio.microsoft.com](./MicrosoftVSDownloadSurrogate.user.js) - The URIs to binaries are inlined into the page within JS objects and are taken from there. I see no legit reason not to render the links server side.
* [FOSSHub](./FOSSHubSurrogate.user.js) - the real direct links are fetched via API and replaced in runtime.
* [GosZakupki (Russian government procurement) (zakupki.gov.ru)](./goszakupki.user.js) - almost everything is hidden using CSS when there is no JS. The links are not links, instead some elements have `url` attribute.
* [Yandex Disk public links (yadi.sk)](./yandex_disk_surrogate.user.js) - the real links are fetched via API. I see no legitimate reason not to do this server side.
* [Yandex Video (video.yandex.ru)](./yandex_video_surrogate.user.js) - some info is fetched via JS. **You need to allow `storage.mds.yandex.net` and `static.video.yandex.net` in uMatrix in order to use this!**
* [habr.com](./habr.com.surrogate.user.js) - only expansion of spoilers is implemented.
* [Hockeypuck Key Server](./hockeypuck_old.surrogate.user.js) - fixes non-working without client-side JS in GUI of old versions.
* [Coursera](./coursera.surrogate.user.js) - Tries to fix the links in the syllabilus and generates a playable `video` tag on the pages with video. Does the both not very correctly for now.
* [ScienceDirect](./sciencedirect.surrogate.user.js) - Constructs URI to PDF with the paper from the info embedded into the web page as JSON. Otherwise the link for PDF downloading is unclickable (even for Open Access papers).
* [YouTube](./youtube.surrogate.user.js) - Generates a playable `video` tag.


Hall of shame
-------------

The following websites obviously intentionally and actively try to disrupt experience of users with JavaScript disabled:
* [ixbt.com (a forum about smart electronics)](./ixbt.user.js) - JS was used to add the HTML into page. The JS was weakly obfuscated.
* [sysadmins.ru (a forum about programming and system administration) ](./sysadmins.ru.surrogate.user.js) - plain text of messages is encrypted using AES-256 in CBC mode. CryptoJS is used as an encryption library. Source of the encryption library was modified a little by modifying the argument used as a key derivation material by taking its slice of from `0` to `5`-th characters. The scripts were obfuscated.
