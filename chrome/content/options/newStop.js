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
function onPage(pagename) {
	var page = document.getElementById("chibustrack-"+pagename+"page");
	var old = document.getElementById("chibustrack-"+pagename+"box");

	//now, get the action and params based on the page
	var verb = null;var params = null; //verb should not be null at end
	switch(pagename) {
		case "route":
			verb = "getroutes";
			//params = null;
			if(old) return; //for route, safe to assume routes don't change (if so, restarting the wizard isn't too horrid)
			break;
		case "dir":
			verb = "getdirections";
			params = {rt: document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")};
			if(old && ExtChiBusTrack._cache['rt'] == params.rt) return; //caching
			ExtChiBusTrack._cache['rt'] = params.rt;
			break;
		case "stop":
			verb = "getstops";
			params = {
				rt:  document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value"),
				dir: document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value") };
			if(old && ExtChiBusTrack._cache['stop'] && params.rt == ExtChiBusTrack._cache['stop']['rt'] && params.dir == ExtChiBusTrack._cache['stop']['dir']) return;
			ExtChiBusTrack._cache['stop'] = new Array();
			ExtChiBusTrack._cache['stop']['rt'] = params.rt;
			ExtChiBusTrack._cache['stop']['dir'] = params.dir;
			break;
	}

	//remove old stuff, show our temp menu
	if(old) page.removeChild(old);
	var menus = page.getElementsByClassName("loading-menus");
	menus.item(0).setAttribute("collapsed",false);

	//now we take care of business B)
	ExtChiBusTrack.loadCTAData(verb,function(doc) {
		var menu = ExtChiBusTrack._styles[pagename].transformToDocument(doc);

		menu.documentElement.id = "chibustrack-"+pagename+"box";
		page.appendChild(menu.documentElement);
		menus.item(0).setAttribute("collapsed",true);
	},params);
}

function finish() {
	var route = document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value");
	var dir = document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value");
	
	//cheat a little, make this next loop work
	//i blame xul for not having a <listbox>.checkItems property
	document.getElementById("chibustrack-stopbox").selectAll();
	document.getElementById("chibustrack-stopbox").selectedItems.forEach(function (e,i,a) {
		if(!e.checked) return;
		var stopname = e.getAttribute("label");
		var stopid = e.getAttribute("value");
		ExtChiBusTrackPrefs.addStop(route,dir,stopname,stopid);
	});
	return true;
}


window.addEventListener("load",function () {
	ExtChiBusTrack._styles['route'] = new XSLTProcessor();
	ExtChiBusTrack._styles['dir'] =   new XSLTProcessor();
	ExtChiBusTrack._styles['stop'] =  new XSLTProcessor();
	
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
	theTransform.load("chrome://chibustrack/content/styles/routetomenu.xslt");

	//more transforms....
	var nextTransform = document.implementation.createDocument("","test",null);
	nextTransform.addEventListener("load",function() {
		ExtChiBusTrack._styles['dir'].importStylesheet(nextTransform);
	},false);
	nextTransform.load("chrome://chibustrack/content/styles/dirtomenu.xslt");
	var nextnextTransform = document.implementation.createDocument("","test",null);
	nextnextTransform.addEventListener("load",function() {
		ExtChiBusTrack._styles['stop'].importStylesheet(nextnextTransform);
	},false);
	nextnextTransform.load("chrome://chibustrack/content/styles/multistoptomenu.xslt");

},false);
