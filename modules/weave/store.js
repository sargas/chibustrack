Components.utils.import("resource://weave/engines.js");
Components.utils.import("resource://weave/stores.js");
Components.utils.import("resource://weave/trackers.js");
Components.utils.import("resource://chibustrack/prefs.js");
Components.utils.import("resource://chibustrack/weave/record.js");
Components.utils.import("resource://weave/util.js");

const EXPORTED_SYMBOLS = ['ChiBusTrackStore'];

function ChiBusTrackStore() {
	this._ChiBusTrackStore_init();
}

ChiBusTrackStore.prototype = {
	__proto__: Store.prototype,
	name: "chibustrack",
	_logName: "ChiBusTrack",
	_map: new Array(),

	_ChiBusTrackStore_init: function ChiBusTrackStore_init() {
		this._init();
		this._log.debug("Chicago Bus Tracker Store loaded");
	},

	createRecord: function(guid, cryptoMetaURL) {
		this._log.debug("Creating record for "+guid+"\n");
		let record = this.cache.get(guid);
		if(record) return record;
		this._log.debug(guid + " not in cache\n");

		record = new ChiBusTrackRecord();

		//load from whats given
		record.id = guid;
		record.encryption = cryptoMetaURL;

		//load from guid
		//guid format is route+"<>"+dir+"<>"+stpid+"<>"+stopnm
		let stop = guid.split("<>");
		if(stop.length != 4) { //we didnt do it....
			//wtf?
			record.deleted = true;
			this._log.debug("Deleting "+guid+" since length is "+stop.length);
			return record;
		}
		record.rt = stop[0];
		record.dir = stop[1];
		record.stpid = stop[2];
		record.stpnm = stop[3];
		this.cache.put(guid,record);

		return record;
	},
	itemExists: function(guid) {
		this._log.debug("Finding if "+guid+" exists.\n");
		let mylog = this._log;
		let stop = guid.split("<>");
		if(stop.length != 4) return false;
		let found = false;
		//search through prefs...
		ExtChiBusTrackPrefs.ensureLoaded();
		ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
			mylog.debug("Comparing with "+e.rt + "<>"+e.dir+"<>"+e.stpid+"<>"+e.stpnm);
			if(e.rt == stop[0] && e.dir == stop[1] && e.stpid == stop[2] && e.stpnm == stop[3]) found=true;
		});
		this._log.debug("Well, turns out "+guid+" exists == "+found);
		return found;
	},
	changeItemId: function(oldid,newid) {
		this._log.debug("Ignoring id change from "+oldid+" to "+newid);
	},
	getAllIDs: function() {
		let mylog = this._log; //cannot use *this* inside the forEach later on
		this._log.debug("Getting all Ids\n");
		let guids = new Object();
		ExtChiBusTrackPrefs.ensureLoaded();
		ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
			let guid = e.rt+"<>"+e.dir+"<>"+e.stpid+"<>"+e.stpnm;
			guids[guid] = guid;
			mylog.debug("getAllIDs is adding "+e.rt+"<>"+e.dir+"<>"+e.stpid+"<>"+e.stpnm);
		});
		return guids;
	},
	wipe: function() {
		this._log.debug("Eck, killall\n");
		//eck, killall
		let prefids = new Array();
		ExtChiBusTrackPrefs.ensureLoaded();
		ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {prefids.push(e.prefid);});
		prefids.forEach(function (e,i,a) {ExtChiBusTrackPrefs.removeStop(e);});
	},
	create: function(record) {
		let stop = record.id.split("<>");
		this._log.debug("Creating "+record.id+", rt: "+stop[0]+", dir: "+
				stop[1]+", stpnm: "+stop[3]+", stpid: "+stop[2]+"\n");
		ExtChiBusTrackPrefs.addStop(stop[0],stop[1],stop[3],stop[2]);
	},
	update: function(record) {
		this._log.debug("Ignoring an update of "+record.id+".");
	},
	remove: function(record) {
		this._log.debug("removing "+record.id+"\n");
		let stop = record.id.split("<>");
		ExtChiBusTrackPrefs.ensureLoaded();
		ExtChiBusTrackPrefs.stops.forEach(function(e,i,a) {
			if(e.rt == stop[0]
				&& e.dir == stop[1]
				&& e.stpid == stop[2]
				&& e.stpnm == stop[3])
				ExtChiBusTrackPrefs.removeStop(e.prefid);
		});
	}

};
