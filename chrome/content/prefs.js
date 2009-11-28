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
var ExtChiBusTrackPrefs = {

sbinterval: null, //interval for service bullintin timer
prefs: null,
bullroutes: null, //comma seperated list of routes
stops: null, //<> seperated values within |
handler: null,

load: function(callback) { //callback should be a function(prefname)
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.chibustrack.");
	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.sbinterval = this.prefs.getIntPref("sbinterval");
	this.bullroutes = this.prefs.getCharPref("bullroutes");
	this.stops = this.prefs.getCharPref("stops");
	this.handler = callback;
	this.prefs.addObserver("", this, false);
},

unload: function() {
	this.prefs.removeObserver("", this);
},

observe: function(subject, topic, data) {
	if (topic != "nsPref:changed") return;
	switch(data) {
		case "sbinterval":
			this.sbinterval = this.prefs.getIntPref("sbinterval");
			break;
		case "bullroutes":
			this.bullroutes = this.prefs.getCharPref("bullroutes");
			break;
		case "stops":
			this.stops = this.prefs.getCharPref("stops");
			break;
	}
	if(this.handler) this.handler(data);
},

};

window.addEventListener("unload", function() {
	ExtChiBusTrackPrefs.unload(); },false);
