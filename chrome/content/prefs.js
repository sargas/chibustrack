var ExtCtaCheckerPrefs = {

sbinterval: null, //interval for service bullintin timer
prefs: null,
bullroutes: null, //comma seperated list of routes
handler: null,

load: function(callback) { //callback should be a function(prefname)
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.ctachecker.");
	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.sbinterval = this.prefs.getIntPref("sbinterval");
	this.bullroutes = this.prefs.getCharPref("bullroutes");
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
	}
	this.handler(data);
},

};

window.addEventListener("unload", function() {
	ExtCtaCheckerPrefs.unload(); },false);
