Surrogates user.js
==================

Some websites were made unusable without JS. Often **intentionally**, as a mean to coerce a user (and harrass the ones who are not coerced) into allowing the website to use JavaScript - a dangerous remote code execution technology abused in the current Web in order to fingerprint users, track their behavior and detect ad-blockers in order to deny them service and capable to be used to exploit hardware (including microarchitectural) and driver vulnerabilities.

NoScript browser extension used to contain a feature called "surrogates", which allowed users to use some websites written the way that without JavaScript the website cannot operate. The solution was to bring an own small and easy-to-audit piece of JavaScript, that allows a website to operate, just without any JS-implemented unapproved, unexpected or malicious functionality, that the website could have.

When NoScript has migrated from Firefox XPCOM to WebExtensions, this functionality hasn't been ported, though the surrogates are [still available in its repo](https://github.com/hackademix/noscript/blob/master/src/legacy/defaults.js#L206L302) (and [here is a PR](https://github.com/hackademix/noscript/pull/12)) with some of my ones).

μBlock also contains something [like that, called "scriptlet", but more limited (no conditional inclusion based on noscript state)](https://github.com/gorhill/uBlock/wiki/Static-filter-syntax#scriptlet-injection). [Here are their scriptlets](https://github.com/gorhill/uBlock/blob/master/assets/resources/scriptlets.js). The good part of their scriptlets is that they have general-purpose scriptlets.

Of course it really makes no sense to implement this functionality in NoScript itself. There are browser extensions of the cathegory of **userscripts managers**, which purpose is executing client-stored scripts on webpages. Ideally they should have some interface allowing other browser extensions to control their behavior using their public API. See [this](https://github.com/open-source-ideas/open-source-ideas/issues/60) and [this](https://github.com/hackademix/noscript/issues/10) for more info about the idea and  [a script that may be helpful](https://github.com/hackademix/noscript/blob/884b6ee146a49682774c806458a8fbf9e0977890/src/surrogates/convert.py). But it is not yet implemented. It is a task for future.

For now our task is to restore surrogate support. The most straightforward way is to just utilize existing userscripts managers.

This repo contains some "surrogates" in a form of `*.user.js` scripts.

WARNING: If you use ViolentMonkey, replace [GM.getResourceUrl of GM](https://wiki.greasespot.net/GM.getResourceUrl) with [GM.getResourceURL of VM](https://violentmonkey.github.io/api/gm/#gm_getresourceurl) (https://github.com/violentmonkey/violentmonkey/issues/1403) in some surrogates if they don't work.

Here are surrogates for some websites having major flaws in compatibility with the browsers with disabled JS:

Can be benign
-------------

### Generic ones

* [all sites using `lazyload` (`data-src` in pics)](lazyload.surr.user.js) - just downloads `lazyload` and runs it.

### Site-specific

* [facecast.net](./facecast.surr.user.js) - A video streaming service. Uses HLS. To get the HLS streams some requests have to be done. And some measurement of user's speed and a ping to select the optimal server for the minimal latency. Currently the surrogate just chooses the first server in the list that have responded within a timeout of 1 second. The surrogate gives you the links you can paste into any player supporting HLS.
* [Bing (bing.com)](./bing.surr.user.js) - Bing returns empty results, unless some cookies are set. It seems that the issue is present only for some users. Other users report that for them everything works fine.
* [support.microsoft.com](./MicrosoftKB.surr.user.js) - Rendering of some knowledge base pages is done using JS from JSON representation on client side. I see no legit reason not to render that server side.
* [visualstudio.microsoft.com](./MicrosoftVSDownload.surr.user.js) - The URIs to binaries are inlined into the page within JS objects and are taken from there. I see no legit reason not to render the links server side.
* [FOSSHub](./FOSSHub.surr.user.js) - the real direct links are fetched via API and replaced in runtime.
* [GosZakupki (Russian government procurement) (zakupki.gov.ru)](./goszakupki.user.js) - almost everything is hidden using CSS when there is no JS. The links are not links, instead some elements have `url` attribute.
* [Googlag Drive file download](./googlag_drive.surr.user.js)
* [Googlag YouTube](./youtube.surr.user.js) - Generates a playable `video` tag.
* [Yandex Disk public links (yadi.sk)](./yandex_disk.surr.user.js) - the real links are fetched via API. I see no legitimate reason not to do this server side.
* [Yandex Video (video.yandex.ru)](./yandex_video.surr.user.js) - some info is fetched via JS. **You need to allow `storage.mds.yandex.net` and `static.video.yandex.net` in uMatrix in order to use this!**
* habr.com:
	* [`habr_com_pic_delossy`](./habr.com_pic_delossy.surr.user.js) - replaces versions of pics compressed with extreme parameters with less spoiled ones ones.
	* [`habr_com_pic_deblur`](./habr.com_pic_deblur.surr.user.js) - removes client-side blur filters from pics.
	* [`habr_com_spoiler_fix`](./habr.com_spoiler.surr.user.js) - expansion of spoilers (with `details/summary`) has been implemented.
* [4PDA](./4pda_spoilers.surr.user.js) - Replaces spoilers with `details/summary`
* [Hockeypuck Key Server](./hockeypuck_old.surr.user.js) - fixes non-working without client-side JS in GUI of old versions.
* [Coursera](./coursera.surr.user.js) - Tries to fix the links in the syllabilus and generates a playable `video` tag on the pages with video. Does the both not very correctly for now.
* [SecurityKiss VPN](./securitykiss.surr.user.js) - Allows you to download a config for your WireGuard. 👍
* [msi.com](./MicroStar.surr.user.js) - Allows to browse products and download software for them.
* [streaming.media.ccc.de](./streaming.media.ccc.de.surr.user.js)
* [sociumin.com](./sociumin.surr.user.js) - Replaces the URIs of the pics with the ones from `dataset` property. WARNING: Firefox Tracking protection blocks VK API URIs (images). Just rely on uMatrix for more granular blocking.
* [data.mos.ru](./data.mos.ru.surr.user.js) - allows to download few latest versions of the datasets + their descriptions.
* [AndroidFileHost](./AndroidFileHost.surr.user.js) - uses JS to download list of mirrors. Contains CloudFlare browser fingerprinting (Picasso) script, but doesn't use CF fingerprinting information anyhow. It can be that it is used by mistake.
* [iichan.hk](./iichan.surr.user.js) - requires a user to set deletion password for every post. If not set, the setting is done in JS. The js-based setting of the hidden field seems to be never used - the conditions needed for it seem to be never triggered. Since we still have to rely on our JS, I have added automatic derivation of deletion password from the hash.
* [Gitea](./gitea.surr.user.js)-based websites, including [Codeberg](https://codeberg.org/) - Gitea devs have done a good job ensuring the website works without JS in large part. Unfortunately there are still pieces not working without JS, such as transferring ownership. It is clearly possible to implement it without JS (and [I have done the similar job for Hockeypuck](https://github.com/hockeypuck/hockeypuck/commit/b5456d8512f460ce2eb0e9093ee1c95dc564f7d8))
* [proxysite.com](./proxysite.surr.user.js) - uses JS to redirect to own subdomains, corresponding to different exit servers.
* [OpenNet.ru](./opennet.surr.user.js) - uses JS for voting and unfolding of hidden comments.
* [Wikipedia](./wikipedia.surr.user.js) - Language chooser no longer works without JS as it used to work. It is because of a CSS rule hiding it. If one undoes effects of that rule, it starts working again.

Hall of shame
-------------

The following websites obviously intentionally and actively try to disrupt experience of users with JavaScript disabled (discriminate against them):

* [ixbt.com (a forum about smart electronics)](./ixbt.surr.user.js) - JS was used to add the HTML into page. The JS was weakly obfuscated.
* [sysadmins.ru (a forum about programming and system administration) ](./sysadmins.ru.surr.user.js) - plain text of messages is encrypted using AES-256 in CBC mode. CryptoJS is used as an encryption library. Source of the encryption library was modified a little by modifying the argument used as a key derivation material by taking its slice of from `0` to `5`-th characters. The scripts were obfuscated.
* ~~[ScienceDirect](./sciencedirect.surr.user.js)~~ - This surrogate constructs URI to PDF with the paper from the info embedded into the web page as JSON. Otherwise the link for PDF downloading is unclickable (even for Open Access papers). **Elsevier has changed their website. Now the link redirects to a page with JavaScript that must be executed in order to get access to PDF. When JS is disabled, it redirects your browser back via a `noscript` tag. `To_Hex_string(AES256_CBC_Encrypt(iv=generate_random_nonce_bits(128), key=SHA256(UTF8_Encode(challengeKey)), plaintext=UTF8_Encode(challengePlaintext)))` is the algorith to generate response. Only after that the website allows us to view PDFs. The main and seemingly the only purpose of this intermediate page is to discriminate against users with JavaScript disabled. the users covered by a paid subscribtion (other ones who have no subscribtion will just get a page requesting sign in)!** Elsevier, this is complete disrespect to your paid subscribers 🖕 and such attitude is completely inacceptable. I wish your subscribers to **boycott** you and cancell all the paid subscribtions. You don't deserve a penny after such an attitude to your paid customers.
* [Some Medium-based websites](./medium.com.surr.user.js) - the article is cut unless a `gi=` parameter is present in the URI. The content of it can be arbitrary. We generate it randomly and it works.
* [Googlag Books](./googlag_books.surr.user.js) - a class `html_page_secure_image` is applied to the area of image. The image itself has `src` pointing to a blank image. A separate stylesheet is present nearby setting the background to the right image. It has another class. So the solution is to replace `className` from `html_page_secure_image` to `html_page_image`. And undo the inline stylesheet of the element having the highest priority and setting background image to a non-meaningful image.
* [`OVD-Info`](./ovd-info.surr.user.js) - Some pages contain an unjustified pop-up "preloader" and hide content of using `visibility: hidden;`. Contains lot of scropts, including one injecting Google Tag Manager.
