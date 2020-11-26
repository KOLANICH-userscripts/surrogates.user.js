// ==UserScript==
// @name grabcad_login_surrogate
// @description Allows to login to GrabCAD without their JS. Not tested, likely obsolete.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://grabcad.com/login
// ==/UserScript==

https://grabcad.com/login
document.getElementById("signInModal").removeAttribute("v-cloak");
var f = document.getElementById("login_form");
var lb = f.getElementsByClassName("sign-in__button")[0];
lb.disabled=false;
