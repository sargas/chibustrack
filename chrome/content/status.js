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
				window.clearInterval(ExtChiBusTrack.sbtimer);
				ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,
					ExtChiBusTrackPrefs.sbinterval*60*1000);
				break;
		}
	});
	ExtChiBusTrack.loadstatusbar();
	ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,ExtChiBusTrackPrefs.sbinterval*60*1000);

	//load up xslt for route predictions
	ExtChiBusTrack._predtobox = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._predtobox.importStylesheet(theTransform);
	},false);
	theTransform.load("chrome://chibustrack/content/predtobox.xslt");
},false);

ExtChiBusTrack.onclick = function(e) {
	if(e.button != 0) return;
	var stopstrs = ExtChiBusTrackPrefs.stops.split('|');
	var hbox = document.getElementById("chibustrack-panel").firstChild;
	while(hbox.firstChild) hbox.removeChild(hbox.firstChild);
	for(var i=0;i<stopstrs.length;++i) {
		if(stopstrs[i] == "") continue;
		var str = stopstrs[i].split("<>");
		var rt = str[0];var rtdir = str[1];var stpid = str[2];
		ExtChiBusTrack.loadCTAData("getpredictions",function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response, "text/xml");
			var xpathexp = doc.createExpression("bustime-response/prd",null);
			if(!xpathexp.evaluate(doc,XPathResult.BOOLEAN_TYPE,null).booleanValue)
				return;
			var box = ExtChiBusTrack._predtobox.transformToDocument(doc);
			hbox.appendChild(box.documentElement);
			document.getElementById("chibustrack-panel").openPopup(e.target,'before_start');
		},{rt: rt, rtdir: rtdir, stpid: stpid});
	}
};
ExtChiBusTrack.onoptionclick = function(e) {
	window.openDialog('chrome://chibustrack/content/options.xul','_blank','chrome,all,dialog=no');
};

