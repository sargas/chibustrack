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
			case "bullroutes":
				ExtChiBusTrack.loadstatusbar();
				break;
			case "sbinterval":
				ExtChiBusTrack.reloadSB();
				break;
		}
	});
	ExtChiBusTrack.loadstatusbar();
	ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,ExtChiBusTrackPrefs.sbinterval*60*1000);

	//load up xslt for route predictions
	ExtChiBusTrack._styles['pred'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['pred'].importStylesheet(theTransform);
	},false);
	theTransform.load("chrome://chibustrack/content/styles/predtobox.xslt");
},false);

ExtChiBusTrack.onclick = function(ev) {
	if(ev.button != 0) return;

	//ah, first run
	if(ExtChiBusTrackPrefs.stops.length == 0) {
		this.onoptionclick(ev);
		return;
	}

	//clear em
	var hbox = document.getElementById("chibustrack-panelbox");
	while(hbox.firstChild) hbox.removeChild(hbox.firstChild);

	//show loading...
	document.getElementById("chibustrack-panelload").setAttribute("collapsed",false);
	document.getElementById("chibustrack-panel").openPopup(ev.target,'before_start');

	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		ExtChiBusTrack.loadCTAData("getpredictions",function(doc) {
			var box = ExtChiBusTrack._styles['pred'].transformToDocument(doc);
			if(box.documentElement == null) return; //xslt is unable to do anything...
			hbox.appendChild(box.documentElement);
			document.getElementById("chibustrack-panelload").setAttribute("collapsed",true);
		},{rt: e.rt, rtdir: e.dir, stpid: e.stpid},true);
	});
};
ExtChiBusTrack.onoptionclick = function(e) {
	window.openDialog('chrome://chibustrack/content/options/options.xul','_blank','chrome,all,dialog=no');
};

