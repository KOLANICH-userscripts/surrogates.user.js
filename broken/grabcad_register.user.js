// ==UserScript==
// @name grabcad_register_surrogate
// @description Allows to register to GrabCAD without their JS. Not tested, likely obsolete.
// @author KOLANICH
// @version 0.1
// @license Unlicense
// @grant none
// @run-at document-idle
// @match https://grabcad.com/profile/register
// ==/UserScript==

//document.getElementById("reg_old").style.display="block";
let rf=document.createElement("form");
fields = ["first_name", "last_name", "email", "password", "phone", ]

