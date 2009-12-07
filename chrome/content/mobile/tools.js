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
window.addEventListener("load", function() {
	ExtChiBusTrackPrefs.load(function(data) {
		switch(data) {
		case "stops":
			ExtChiBusTrack.loadStops();
			break;
		}
	});
},false);

ExtChiBusTrack.loadStops = function () { //mobile version :)
	var selstops = document.getElementById("chibustrack-selstops");

	//clear the routes
	while(selstops.firstChild) selstops.removeChild(selstops.firstChild);

	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		var newlistitem = document.createElement("listitem");
		newlistitem.setAttribute("label","Route "+e.rt+", "+e.dir+": "+e.stpnm);
		newlistitem.setAttribute("value",e.prefid);
		selstops.appendChild(newlistitem);
		document.getElementById("chibustrack-rmStop").setAttribute("disabled",false);
	});
	if(!selstops.hasChildNodes()) {
		document.getElementById("chibustrack-rmStop").setAttribute("disabled",true);
	}
};

ExtChiBusTrack.addStopRoute = function(e) {
	var deck = document.getElementById("chibustrack-deck");
	deck.selectedIndex = 1;

	//no need to load if we got our old menu (assuming this doesn't change while we are here)
	var old = document.getElementById("chibustrack-routebox");
	if(old) return;

	//load routes
	ExtChiBusTrack._styles['route'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['route'].importStylesheet(theTransform);
		ExtChiBusTrack.loadStopPage('route');
	},false);
	theTransform.load("chrome://chibustrack/content/styles/richroutetomenu.xslt");
};

ExtChiBusTrack.addStopDir = function(e) {
	document.getElementById("chibustrack-deck").selectedIndex = 2;
	var old = document.getElementById("chibustrack-dirbox");
	if(old && ExtChiBusTrack._paramsD == document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")){
		//looking familiar....
		return;
	} else if(old) ExtChiBusTrack.resetPage('dir'); //suprisingly this is valid syntax

	//load dirs
	ExtChiBusTrack._styles['dir'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['dir'].importStylesheet(theTransform);
		ExtChiBusTrack.loadStopPage('dir');
	},false);
	theTransform.load("chrome://chibustrack/content/styles/richdirtomenu.xslt");
};

ExtChiBusTrack.addStopStop = function(e) {
	document.getElementById("chibustrack-deck").selectedIndex = 3;

	//reload or ignore if needed
	var old = document.getElementById("chibustrack-stopbox");
	if(old
		&& ExtChiBusTrack._paramsS['rt'] == document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")
		&& ExtChiBusTrack._paramsS['dir'] == document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value")){
		//we've been here before....
		return;
	} else if(old) ExtChiBusTrack.resetPage('stop');

	//load stops
	ExtChiBusTrack._styles['stop'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['stop'].importStylesheet(theTransform);
		ExtChiBusTrack.loadStopPage('stop');
	},false);
	theTransform.load("chrome://chibustrack/content/styles/richstoptomenu.xslt");
};

ExtChiBusTrack.addStopFinal = function(e) {
	//yippi, lets add the stop
	var route = document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value");
	var dir = document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value");
	var stopname = document.getElementById("chibustrack-stopbox").getSelectedItem(0).getAttribute("label");
	var stopid = document.getElementById("chibustrack-stopbox").getSelectedItem(0).getAttribute("value");
	ExtChiBusTrackPrefs.addStop(route,dir,stopname,stopid);

	ExtChiBusTrack.resetPage("dir");
	document.getElementById("chibustrack-deck").selectedIndex = 0;
	ExtChiBusTrack.resetPage("stop");
};

ExtChiBusTrack.loadStopPage = function(pagename) {
	var page = document.getElementById("chibustrack-"+pagename+"page");

	var loadingbox = page.getElementsByClassName("chibustrack-loadingmenus");
	loadingbox.item(0).setAttribute("collapsed",false);

	//next, get the action and params based on the page
	//verb should not be null at end
	var verb = null;var params = null;var curpage = null;var nextaction=null;var nextString = null;
	switch(pagename) {
		case "route":
			verb = "getroutes";
			curpage = 1;
			nextaction = ExtChiBusTrack.addStopDir;
			nextString = "Choose Direction";
			break;
		case "dir":
			verb = "getdirections";
			params = {rt: document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")};
			curpage = 2;
			nextaction = ExtChiBusTrack.addStopStop;
			nextString = "Choose Stop";
			ExtChiBusTrack._paramsD = params.rt;
			break;
		case "stop":
			verb = "getstops";
			params = {
				rt:  document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value"),
				dir: document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value") };
			curpage = 3;
			nextaction = ExtChiBusTrack.addStopFinal;
			nextString = "Add Stop";
			ExtChiBusTrack._paramsS['rt'] = params.rt;
			ExtChiBusTrack._paramsS['dir'] = params.dir;
			break;
	}

	//now we take care of business B)
	ExtChiBusTrack.loadCTAData(verb,function(doc) {
		//setup menu
		var menu = ExtChiBusTrack._styles[pagename].transformToDocument(doc);
		menu.documentElement.id = "chibustrack-"+pagename+"box";
		menu.documentElement.setAttribute("flex","1");

		//setup buttons
		var hbox = document.createElement("hbox");
		hbox.id = "chibustrack-"+pagename+"supportbox";
		var nextButton = document.createElement("button");
		nextButton.setAttribute("label",nextString);
		nextButton.addEventListener("click",nextaction,false);
		hbox.appendChild(nextButton);
		var spacer = document.createElement("spacer");
		spacer.setAttribute("flex","1");
		hbox.appendChild(spacer);
		var cancelButton = document.createElement("button");
		cancelButton.setAttribute("label","Cancel");
		cancelButton.addEventListener("click",function(event) {document.getElementById('chibustrack-deck').selectedIndex = curpage-1},false);
		hbox.appendChild(cancelButton);

		//add elements to page
		page.appendChild(menu.documentElement);
		page.appendChild(hbox);
		loadingbox.item(0).setAttribute("collapsed",true);
	},params);
};

ExtChiBusTrack.resetPage = function(pagename) {
	var page = document.getElementById("chibustrack-"+pagename+"page");

	var loadingbox = page.getElementsByClassName("chibustrack-loadingmenus");
	loadingbox.item(0).setAttribute("collapsed",false);

	var old = document.getElementById("chibustrack-"+pagename+"box");
	if(old) {
		page.removeChild(old);
		page.removeChild(document.getElementById("chibustrack-"+pagename+"supportbox"));
	}
};

ExtChiBusTrack.checkTimes = function(useCache) {
	document.getElementById("chibustrack-deck").selectedIndex = 4;

	var selstops = document.getElementById("chibustrack-selstops");
	if(selstops.selectedItem == null) return;
	var prefid = selstops.selectedItem.getAttribute("value");
	var stop = ExtChiBusTrackPrefs.getStop(prefid);

	if(useCache && ExtChiBusTrack._cache &&
			(ExtChiBusTrack._cache.rt == stop.rt) &&
			(ExtChiBusTrack._cache.dir == stop.dir) &&
			(ExtChiBusTrack._cache.stpid == stop.stpid) &&
			(new Date().getTime() - ExtChiBusTrack._cache.time < 1000*ExtChiBusTrackPrefs.cachetime) ){
		return;
	}
	stop.time = new Date().getTime(); //original time in milliseconds
	ExtChiBusTrack._cache = stop;
	
	var page = document.getElementById("chibustrack-predpage");
	var loadingbox = page.getElementsByClassName("chibustrack-loadingmenus").item(0);
	
	//clear previous stuff
	while(page.lastChild != loadingbox) page.removeChild(page.lastChild);

	//load prediction(s)
	ExtChiBusTrack._styles['pred'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['pred'].importStylesheet(theTransform);
		ExtChiBusTrack.loadCTAData("getpredictions",function(doc) {
			var box = ExtChiBusTrack._styles['pred'].transformToDocument(doc);
			if(box.documentElement == null) { //handle an unknown error (no errror tags) :( )
				box = document.createElement("vbox");
				var templabel = document.createElement("label");
				templabel.textContent = "An unknown error has occured";
				var tempbutton = document.createElement("button");
				tempbutton.setAttribute("label","Go Back");
				tempbutton.setAttribute("oncommand","document.getElementById('chibustrack-deck').selectedIndex = 0");
				box.appendChild(templabel);
				box.appendChild(tempbutton);
			} else box = box.documentElement;
			page.appendChild(box);
			loadingbox.setAttribute("collapsed",true);
		},{rt: stop.rt, rtdir: stop.dir, stpid: stop.stpid},true);
	},false);
	theTransform.load("chrome://chibustrack/content/styles/fancypredtobox.xslt");
};
