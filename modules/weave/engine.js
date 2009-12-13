Components.utils.import("resource://weave/engines.js");
Components.utils.import("resource://weave/stores.js");
Components.utils.import("resource://weave/trackers.js");
Components.utils.import("resource://chibustrack/weave/record.js");
Components.utils.import("resource://chibustrack/weave/store.js");
Components.utils.import("resource://chibustrack/weave/tracker.js");
Components.utils.import("resource://weave/util.js");

const EXPORTED_SYMBOLS = ['ChiBusTrackEngine'];

function ChiBusTrackEngine() {
	this._init();
}
ChiBusTrackEngine.prototype = {
	__proto__: SyncEngine.prototype,
	name: "chibustrack",
	displayName: "Chicago Bus Tracker",
	description: "Synchronize your monitored bus stops",
	logName: "ChiBusTrack",
	_recordObj: ChiBusTrackRecord,
	_storeObj: ChiBusTrackStore,
	_trackerObj: ChiBusTrackTracker
};
