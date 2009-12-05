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
function loadRoutes() {
	var page = document.getElementById("chibustrack-routepage");

	//remove old stuff, show our temp menu
	var old = document.getElementById("chibustrack-routebox");
	if(old) page.removeChild(old);
	var menus = page.getElementsByClassName("loading-menus");
	menus.item(0).setAttribute("collapsed",false);

	//now we take care of business B)
	ExtChiBusTrack.loadCTAData("getroutes",function(doc) {
		var menu = ExtChiBusTrack._styles["route"].transformToDocument(doc);

		menu.documentElement.id = "chibustrack-routebox";
		page.appendChild(menu.documentElement);
		menus.item(0).setAttribute("collapsed",true);
	});
}

function finish() {
	//cheat a little, make this next loop work
	//i blame xul for not having a <listbox>.checkItems property
	document.getElementById("chibustrack-routebox").selectAll();
	document.getElementById("chibustrack-routebox").selectedItems.forEach(function (e,i,a) {
		if(!e.checked) return;
		var route = e.getAttribute("value");
		ExtChiBusTrackPrefs.addBullRoute(route);
	});

	return true;
}


window.addEventListener("load",function () {
	ExtChiBusTrack._styles['route'] = new XSLTProcessor();
	
	// from mdc
	var theTransform = document.implementation.createDocument("", "test", null);
	// just an example to get a transform into a script as a DOM
	// XMLDocument.load is asynchronous, so all processing happens in the 
	// onload handler

	//initialize the xslt stylesheet.
	//Needed to be done right away to avoid a race condition
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['route'].importStylesheet(theTransform);
	}, false);
	theTransform.load("chrome://chibustrack/content/styles/multiroutetomenu.xslt");

	//we need prefs
	ExtChiBusTrackPrefs.load();
},false);
