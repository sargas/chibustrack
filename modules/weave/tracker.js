Components.utils.import("resource://weave/engines.js");
Components.utils.import("resource://weave/stores.js");
Components.utils.import("resource://weave/trackers.js");
Components.utils.import("resource://chibustrack/prefs.js");
Components.utils.import("resource://weave/util.js");

const EXPORTED_SYMBOLS = ['ChiBusTrackTracker'];

function ChiBusTrackTracker() {
	this._init();
}
ChiBusTrackTracker.prototype = {
	__proto__: Tracker.prototype,
	_logName: "ChiBusTrackTracker",
	file: "chibustrack",
	name: "chibustrack",

	_init: function ChiBusTrackTracker_init() {
		Tracker.prototype._init.call(this)
		//this.__proto__.__proto__._init.call(this);
		let thistracker = this;
		ExtChiBusTrackPrefs.addHandler(false, function(data,stop) { //unlike most we care about which stop changed
			//NOTE::::::::::::: CANNOT USE THIS._LOG !!!!!!
			if(data == "stops") { //only matters about the *.rt updates....
				thistracker.score = 100;
			}
		});
	},
};
