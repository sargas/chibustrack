/* ***** BEGIN LICENSE BLOCK *****
    This file is part of Chicago Bus Tracker.

    Chicago Bus Tracker is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Chicago Bus Tracker is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Chicago Bus Tracker.  If not, see <http://www.gnu.org/licenses/>.
    ***** END LICENSE BLOCK *****/
window.addEventListener("load",function () {
	document.documentElement.getButton("extra2").collapsed = true;
	document.getElementById("chibustrack-errormsg").textContent = window.arguments[0];
	document.getElementById("chibustrack-errorresponse").setAttribute("value",window.arguments[1]);
	document.getElementById("chibustrack-errorrequest").setAttribute("value",window.arguments[2]);
},false);

function showMore() {
	document.getElementById("more-info").setAttribute("hidden",false);
	document.documentElement.getButton("disclosure").collapsed = true;
}
