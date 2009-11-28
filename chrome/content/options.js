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
	
	ExtChiBusTrackPrefs.load(function(data) {
		switch(data) {
		case "bullroutes":
			ExtChiBusTrack.loadBullRoutes();
			break;
		}
	});
	ExtChiBusTrack._routetomenu = new XSLTProcessor();

	// from mdc
	var theTransform = document.implementation.createDocument("", "test", null);
	// just an example to get a transform into a script as a DOM
	// XMLDocument.load is asynchronous, so all processing happens in the 
	// onload handler

	//initialize the xlst stylesheet.
	//Needed to be done right away to avoid a race condition
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._routetomenu.importStylesheet(theTransform);
		ExtChiBusTrack.loadroutes();
	}, false);
	theTransform.load("chrome://chibustrack/content/routetomenu.xslt");
	ExtChiBusTrack.loadBullRoutes();
},false);
