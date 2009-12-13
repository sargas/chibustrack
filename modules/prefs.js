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

var EXPORTED_SYMBOLS = ["ExtChiBusTrackPrefs"];

var ExtChiBusTrackPrefs = {

sbinterval: null, //interval for service bullintin timer
prefs: null,
bullroutes: null, //comma seperated list of routes
stops: null, //objects
cachetime: null, //seconds for how long to keep prefs for
handlers: new Object(), //callbacks for custom actions on pref changes
firstrun: null, //idealy this rarely changes :P
showInTools: null, //for eric, but making easy to turn off

load: function() {
	if(this.prefs) return; //lets not do this twice
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.chibustrack.");

	//get our prefs....
	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.sbinterval = this.prefs.getIntPref("sbinterval");
	this.bullroutes = this.prefs.getCharPref("bullroutes");
	this.firstrun = this.prefs.getBoolPref("firstrun");
	this.cachetime = this.prefs.getCharPref("cachetime");
	this.showInTools = this.prefs.getBoolPref("showInTools");
	//setup complicated prefs
	this.loadstops();

	//setup listener
	this.prefs.addObserver("", this, false);
},

addHandler: function(parentwindow, callback) { //callback should take prefname as single argument
	this.ensureLoaded();

	//give reasonably random name
	let name = "";
	do {name = (((1+Math.random())*0x100000000)|0).toString(32).substring(1)}
		while(typeof this.handlers[name] != "undefined"); //ensure unique
	this.handlers[name] = callback;

	if(parentwindow) //remove when done (optional if never done)
		parentwindow.addEventListener("unload", function() {
			ExtChiBusTrackPrefs.removeHandler(name); },false);
},

ensureLoaded: function() { //quick conditional
	if(this.prefs == null) this.load();
},

removeHandler: function(name) {
	if(this.handlers[name]) delete this.handlers[name];
},

unload: function() {
	if(this.prefs ==null) return;
	this.prefs.removeObserver("", this);
},

loadstops: function() {
	this.ensureLoaded();
	let stops = this.prefs.getChildList("stops.",{});
	let rtregex = /stops\.([0-9]+)\.rt$/;
	let stopnames = stops.filter(function(e,i,a) {return (rtregex.exec(e)!==null)});
	let prefids = stopnames.map(function(e) { return e.replace(rtregex,"$1")});
	this.stops = new Array();
	prefids.forEach(function(e,i,a) {
		let temp = new Array("rt","dir","stpid","stpnm");
		let tempb = false;
		temp.forEach(function (ea,ia,aa) {
			if(!ExtChiBusTrackPrefs.prefs.prefHasUserValue("stops."+e+"."+ea)) {
				tempb = true;
			}
		});
		if(tempb) return;
		ExtChiBusTrackPrefs.stops.push({
			prefid: e,
			rt: ExtChiBusTrackPrefs.prefs.getCharPref("stops."+e+".rt"),
			dir: ExtChiBusTrackPrefs.prefs.getCharPref("stops."+e+".dir"),
			stpid: ExtChiBusTrackPrefs.prefs.getIntPref ("stops."+e+".stpid"),
			stpnm: ExtChiBusTrackPrefs.prefs.getCharPref("stops."+e+".stpnm") });
	});
},

observe: function(subject, topic, data) {
	if (topic != "nsPref:changed") return;

	let originaldata = data;
	let stopregex = /^stops\.(\d+)\.rt$/; // get the *.rt changes, matters that we only get when *all* added
	let result = stopregex.exec(data);
	if(result !== null) data = "stops"; //if *.rt change, assume all stops are updated

	let extra = null;
	switch(data) {
		case "sbinterval":
			this.sbinterval = this.prefs.getIntPref("sbinterval");
			break;
		case "bullroutes":
			this.bullroutes = this.prefs.getCharPref("bullroutes");
			break;
		case "stops":
			extra = this.getStop(result[1]); //get the old stop...
			this.loadstops();
			if(!extra) extra = this.getStop(result[1]); //get new one if there was no old one
			break;
		case "cachetime":
			this.cachetime = this.prefs.getCharPref("cachetime");
			break;
		case "showInTools":
			this.showInTools = this.prefs.getBoolPref("showInTools");
	}


	for(let callbackname in this.handlers) {
		let callback = this.handlers[callbackname];
		callback(data,extra);
	};

	//note that the following applied when each window would create an ExtChiBusTrackPrefs object
	//the workaround is no longer needed since this object as moved to a module, but the info is
	//kept here for reference.

	//okay, here is everything i know about this bug:
	//multiple observers need to be present (aka, main overlay, dialog, wizards, etc)
	//the first observer will get this function called
	//if this first observer does not do anything (or does something with the same pref called,
	//for example data="ballroutes" causing getCharPref("bullroutes")), then all the other observers
	//will get the same call to their observers
	//
	//now, if it does something else....like, for instance, calls a get*Pref or anything on other prefs,
	//then the first observer will recieve the right signal, but the others will see that the last pref
	//touched was the one that changed (INSTEAD OF THE ONE THAT ACTUALLY CHANGD).
	//
	//I don't know if i'm misunderstanding the pref system or what, but this does suck. and I can't think
	//of another way to avoid going through all routes except caching.
	//
	//So i'm just gonna run prefHasUserValue at the very end on the one originally called with and let this bug
	//rest for now with this workaround. Hopefully its not a firefox bug.
	//this.prefs.prefHasUserValue(originaldata);
},

addStop: function(route, dir, stopname, stopid) {
	this.ensureLoaded();
	//see if we got any duplicate of this....
	let tempflag = false;
	this.stops.forEach(function (e,i,a) {
		if(e.rt == route && e.stpid == stopid && e.dir == dir) tempflag = true;
	});
	if(tempflag) return;

	//get next free pref id...
	let i = 1;
	while(this.prefs.prefHasUserValue("stops."+i+".rt")) i++;

	this.prefs.setCharPref("stops."+i+".dir",dir);
	this.prefs.setCharPref("stops."+i+".stpnm",stopname);
	this.prefs.setIntPref ("stops."+i+".stpid",stopid);
	this.prefs.setCharPref("stops."+i+".rt",route);
},

removeStop: function (prefid) {
	this.ensureLoaded();
	this.prefs.clearUserPref("stops."+prefid+".dir");
	this.prefs.clearUserPref("stops."+prefid+".stpnm");
	this.prefs.clearUserPref("stops."+prefid+".stpid");
	this.prefs.clearUserPref("stops."+prefid+".rt");
},

getStop: function (prefid) {
	this.ensureLoaded();
	let returnThingy = null; //returns null if not found
	this.stops.forEach(function(e,i,a) {
		if(e.prefid == prefid)
			returnThingy = e; });
	return returnThingy;
},

addBullRoute: function (route) {
	this.ensureLoaded();
	//for now, ignoring duplicate routes
	if(this.bullroutes.split(';').indexOf(route) == -1) {
		this.prefs.setCharPref("bullroutes",this.bullroutes + ";" + route);
	}
},

removeBullRoute: function (route) {
	this.ensureLoaded();
	//might as well sort the list in the prefs while we're at it
	let routes = this.bullroutes.split(';').sort(function(a,b) {return parseInt(a)-parseInt(b);});
	let newroutes = new Array();

	for(let i=0;i<routes.length;++i) {
		if(routes[i] != route && routes[i] != "") newroutes.push(routes[i]);
	}
	this.prefs.setCharPref("bullroutes",newroutes.join(";"));
},

};

