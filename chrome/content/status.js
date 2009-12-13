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

Components.utils.import("resource://chibustrack/weave/engine.js");

window.addEventListener("load", function() {
	Weave.Engines.register(ChiBusTrackEngine);
	ExtChiBusTrackPrefs.addHandler(window,function(data) {
		switch(data) {
			case "bullroutes":
				ExtChiBusTrack.loadstatusbar();
				break;
			case "sbinterval":
				ExtChiBusTrack.reloadSB();
				break;
			case "showInTools":
				document.getElementById("chibustrack-menu").setAttribute("collapsed",!ExtChiBusTrackPrefs.showInTools);
				break;
		}
	});
	document.getElementById("chibustrack-menu").setAttribute("collasped",!ExtChiBusTrackPrefs.showInTools);
	ExtChiBusTrack.reloadSB();

	//load up xslt for route predictions
	ExtChiBusTrack._styles['pred'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['pred'].importStylesheet(theTransform);
	},false);
	theTransform.load("chrome://chibustrack/content/styles/predtobox.xslt");

	//handle our first time ran (running?)
	if(ExtChiBusTrackPrefs.firstrun) {
		gBrowser.addTab("chrome://chibustrack/content/help.xhtml");
		ExtChiBusTrackPrefs.prefs.setBoolPref("firstrun",false);
	}
},false);

ExtChiBusTrack.onclick = function(ev) {
	if(ev.button != 0) return;

	//ah, first run
	if(ExtChiBusTrackPrefs.stops.length == 0) {
		this.onoptionclick(ev);
		return;
	}

	var mystpnum = Math.floor(Math.random()*200);
	ExtChiBusTrack._stpnum = mystpnum;
	//clear em
	var hbox = document.getElementById("chibustrack-panelbox");
	while(hbox.firstChild) hbox.removeChild(hbox.firstChild);

	//show loading...
	document.getElementById("chibustrack-panelload").setAttribute("collapsed",false);
	document.getElementById("chibustrack-panel").openPopup(ev.target,'before_start');

	var rterrors = new Array();
	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		ExtChiBusTrack.loadCTAData("getpredictions",function(doc) {
			if(ExtChiBusTrack._stpnum != mystpnum) return;
			var box = ExtChiBusTrack._styles['pred'].transformToDocument(doc);
			if(box.documentElement == null) { //no prediction //not an error
				box = document.createElement("vbox");
				var templabel = document.createElement("label");
				templabel.textContent = "Route "+e.rt+ " ("+e.dir + ")";
				var templabel2 = document.createElement("label");
				templabel2.textContent = e.stpnm;
				var templabel3 = document.createElement("label");
				templabel3.textContent = "No Predictions Available";
				box.appendChild(templabel);
				box.appendChild(templabel2);
				box.appendChild(templabel3);
			} else box = box.documentElement; //little hack

			//any errors
			if(box.getElementsByClassName("chibustrack-errors").length != 0) {
				if(rterrors.indexOf(e.rt) == -1) {
					rterrors.push(e.rt);
				} else {
					return;
				}
			}
			hbox.appendChild(box);
			document.getElementById("chibustrack-panelload").setAttribute("collapsed",true);
		},{rt: e.rt, rtdir: e.dir, stpid: e.stpid},true);
	});
};
ExtChiBusTrack.onoptionclick = function(e) {
	window.openDialog('chrome://chibustrack/content/options/options.xul','_blank','chrome,all,dialog=yes');
};

ExtChiBusTrack.onaboutclick = function(e) {
	window.openDialog('chrome://chibustrack/content/about.xul','_blank','chrome,all,dialog=yes');
};
