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
	ExtChiBusTrackPrefs.addHandler(window,function(data) {
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
	});
	ExtChiBusTrack.toggleFromList('chibustrack-selstops','chibustrack-checktimes');
	ExtChiBusTrack.toggleFromList('chibustrack-selstops','chibustrack-rmStop');
};

ExtChiBusTrack.addStopRoute = function(e) {
	var deck = document.getElementById("chibustrack-deck");
	deck.selectedIndex = 1;

	//no need to load if we got our old menu (assuming this doesn't change while we are here)
	var old = document.getElementById("chibustrack-routebox");
	if(old) return;

	ExtChiBusTrack.loadStopPage('route');
};

ExtChiBusTrack.addStopDir = function(e) {
	document.getElementById("chibustrack-deck").selectedIndex = 2;
	var old = document.getElementById("chibustrack-dirbox");
	if(old && ExtChiBusTrack._cache['rt'] == document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")){
		//looking familiar....
		return;
	} else if(old) ExtChiBusTrack.resetPage('dir'); //suprisingly this is valid syntax

	ExtChiBusTrack.loadStopPage('dir');
};

ExtChiBusTrack.addStopStop = function(e) {
	document.getElementById("chibustrack-deck").selectedIndex = 3;

	//reload or ignore if needed
	var old = document.getElementById("chibustrack-stopbox");
	if(old  && ExtChiBusTrack._cache['stop']
		&& ExtChiBusTrack._cache['stop']['rt'] == document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value")
		&& ExtChiBusTrack._cache['stop']['dir'] == document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value")){
		//we've been here before....
		return;
	} else if(old) ExtChiBusTrack.resetPage('stop');

	ExtChiBusTrack.loadStopPage('stop');
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
	//load xslt
	ExtChiBusTrack._styles[pagename] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles[pagename].importStylesheet(theTransform);
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
				ExtChiBusTrack._cache['rt'] = params.rt;
				break;
			case "stop":
				verb = "getstops";
				params = {
					rt:  document.getElementById("chibustrack-routebox").getSelectedItem(0).getAttribute("value"),
					dir: document.getElementById("chibustrack-dirbox").getSelectedItem(0).getAttribute("value") };
				curpage = 3;
				nextaction = ExtChiBusTrack.addStopFinal;
				nextString = "Add Stop";
				ExtChiBusTrack._cache['stop'] = new Array();
				ExtChiBusTrack._cache['stop']['rt'] = params.rt;
				ExtChiBusTrack._cache['stop']['dir'] = params.dir;
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
			nextButton.id = "chibustrack-"+pagename+"nextbutton";
			nextButton.setAttribute("label",nextString);
			nextButton.addEventListener("click",nextaction,false);
			nextButton.disabled = true;
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
	},false); //addEventListener for xslt
	theTransform.load("chrome://chibustrack/content/styles/rich"+pagename+"tomenu.xslt");
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

	if(useCache && ExtChiBusTrack._cache['pred'] &&
			(ExtChiBusTrack._cache['pred'].rt == stop.rt) &&
			(ExtChiBusTrack._cache['pred'].dir == stop.dir) &&
			(ExtChiBusTrack._cache['pred'].stpid == stop.stpid) &&
			(new Date().getTime() - ExtChiBusTrack._cache['pred'].time < 1000*ExtChiBusTrackPrefs.cachetime) ){
		return;
	}
	stop.time = new Date().getTime(); //original time in milliseconds
	ExtChiBusTrack._cache['pred'] = stop;
	
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
			if(box.documentElement == null) { // no predictions
				box = document.createElement("vbox");
				box.setAttribute("flex",1);
				var templabel = document.createElement("label");
				templabel.textContent = "No Arrival Times are available.";

				box.appendChild(templabel);
			} else box = box.documentElement;

			//add main thing
			page.appendChild(box);

			var footer = document.createElement("hbox");
			var tempbutton = document.createElement("button");
			tempbutton.setAttribute("label","Refresh");
			tempbutton.addEventListener("command", function(event) {ExtChiBusTrack.checkTimes(false);},false);
			var spacer1 = document.createElement("spacer");
			spacer1.setAttribute("flex",1);
			var tempbutton2 = document.createElement("button");
			tempbutton2.setAttribute("label","Check Bulletins");
			tempbutton2.addEventListener("command",function(event) {ExtChiBusTrack.getBull(stop.rt);},false);
			var spacer2 = document.createElement("spacer");
			spacer2.setAttribute("flex",1);
			var tempbutton3 = document.createElement("button");
			tempbutton3.setAttribute("label","Back");
			tempbutton3.addEventListener("command",function(event) { document.getElementById('chibustrack-deck').selectedIndex = 0},false);
			footer.appendChild(tempbutton);footer.appendChild(spacer1);
			footer.appendChild(tempbutton2);footer.appendChild(spacer2);
			footer.appendChild(tempbutton3);
			page.appendChild(footer);

			loadingbox.setAttribute("collapsed",true);
		},{rt: stop.rt, rtdir: stop.dir, stpid: stop.stpid},true);
	},false);
	theTransform.load("chrome://chibustrack/content/styles/fancypredtobox.xslt");
};

ExtChiBusTrack.getBull = function(rt) {
	document.getElementById("chibustrack-deck").selectedIndex = 5;

	//initialize things
	var page = document.getElementById("chibustrack-sbpage");
	var loadingbox = page.getElementsByClassName("chibustrack-loadingmenus");
	loadingbox.item(0).setAttribute("collapsed",false);

	while(page.lastChild != loadingbox.item(0)) page.removeChild(page.lastChild); //clear everything

	//setup future
	var vbox = document.createElement("vbox");
	var backbutton = document.createElement("button");
	backbutton.setAttribute("label","Go Back");
	vbox.setAttribute("flex",1);
	backbutton.setAttribute("oncommand","document.getElementById('chibustrack-deck').selectedIndex = 4");

	ExtChiBusTrack.loadCTAData("getservicebulletins",function(doc) {

		var list = document.createElement("richlistbox");
		list.setAttribute("flex",1); //we want as tall as possible

		var sb = doc.documentElement.children;
		for (var i = 0; i < sb.length; i++) {
			var item = document.createElement("richlistitem");
			var name = sb[i].getElementsByTagName("nm")[0].textContent;
			var subject = sb[i].getElementsByTagName("sbj")[0].textContent;
			var details = sb[i].getElementsByTagName("dtl")[0].textContent;

			var desc = document.createElement("description");
			desc.textContent = name;

			var tempbox = document.createElement("description");
			tempbox.style.maxWidth = page.scrollWidth+"px"; //adaptive :)
			//want to parse <br/> away
			tempbox.textContent = details.replace(/<br.>/g,"\n");

			var bigbox = document.createElement("vbox");
			bigbox.appendChild(desc);
			bigbox.appendChild(tempbox);
			item.appendChild(bigbox);
			list.appendChild(item);
		}

		//now add (if any)
		loadingbox.item(0).setAttribute("collapsed",true);
		if(list.children.length < 1) {
			var nothing = document.createElement("label");
			nothing.textContent = "No Service Bulletins for Route "+rt;
			vbox.appendChild(nothing);
		} else {
			vbox.appendChild(list);
		}
		vbox.appendChild(backbutton);
		page.appendChild(vbox);
	},{rt: rt});
};
