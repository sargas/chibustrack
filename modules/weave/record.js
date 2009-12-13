//based on tabs...
Components.utils.import("resource://weave/util.js");
Components.utils.import("resource://weave/base_records/crypto.js");

const EXPORTED_SYMBOLS = ['ChiBusTrackRecord'];

function ChiBusTrackRecord(uri) {
	this._ChiBusTrackRecord_init(uri);
}
ChiBusTrackRecord.prototype = {
	__proto__: CryptoWrapper.prototype,
	_logName: "Record.ChiBusTrack",

	_ChiBusTrackRecord_init: function ChiBusTrackRecord_init(uri) {
		this._CryptoWrap_init(uri);
		this.cleartext = {};
	},

};

Utils.deferGetSet(ChiBusTrackRecord, "cleartext", ["rt","dir","stpid","stpnm"]);
