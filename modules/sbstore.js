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

var EXPORTED_SYMBOLS = ["ExtChiBusTrackSBStore"];

var ExtChiBusTrackSBStore = {
dbcon: null,
handlers: new Object(), //callbacks for custom actions on store changes

_ignoreResponse: { //callback when we don't care about response
	handleResult: function(aResultSet) {}, //we don't care the response
	handleError: function(aError) {
		dump("TODO, BETTER HANDLING FOR THIS: "+ aError.message);
	},
	handleCompletion: function(aReason) {
		if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
			dump("TODO, BETTER THING TO DO, THINK Query canceled or aborted!");
		}
	}
},

init: function() {
	//make sure we got a db...
	let file = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("ProfD", Components.interfaces.nsIFile);
	file.append("chibustrack.sqlite");

	let storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	this.dbcon = storageService.openDatabase(file);

	let tablelist = this.dbcon.createStatement("select count(*) from SQLite_Master");
	tablelist.executeAsync({
		handleResult: function(aResultSet) {
			let num = aResultSet.getNextRow().getResultByIndex(0);
			if(num == 0) { //better initialize the table
				ExtChiBusTrackSBStore.initTable();
			}
		},
		handleError: function(aError) {
			dump("TODO, BETTER HANDLING FOR THIS: "+ aError.message);
		},
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
				dump("TODO, BETTER THING TO DO, THINK Query canceled or aborted!");
			}
		}
	});
},

initTable: function() {
	let newbulletins = this.dbcon.createStatement("CREATE TABLE bulletins ("+
			"id INTEGER PRIMARY KEY,"+
			"system VARCHAR(255),"+
			"rt VARCHAR(255)," + //really should be VARCHAR(3), but this is sqlite
			"name VARCHAR(255),"+
			"subject VARCHAR(255),"+
			"details VARCHAR(255),"+ //note: do s#<br/>#\n#g to this first
			"ignored BOOLEAN"+
			")");
	newbulletins.executeAsync(this._ignoreResponse);
},

refreshSBs: function(route,sbarr) { //TODO: get route from first item, if exists
	//sbarr is an array of {name: .., subject: ..., details: ...}
	//assuming system is "CTA" for now
	
	//first we get all of our cache, then filter
	let sqlcommand = this.dbcon.createStatement("SELECT id, name FROM bulletins WHERE system='CTA' AND rt = :rt");
	sqlcommand.params.rt = route;
	sqlcommand.executeAsync({
		handleResult: function(aResultSet) {
			for(let row = aResultSet.getNextRow();row;row = aResultSet.getNextRow()) {
				let sbname = row.getResultByName("name");
				//get rid of the sb if we have it already
				let found = false;
				sbarr = sbarr.filter(function(e,i,a) {
					if(sbname == e.name) {
						found = true;
						return false;
					} else {
						return true;
					}
				});
				if(!found) { //great, now we gotta delete it
					let deletecommand = ExtChiBusTrackSBStore.dbcon.createStatement("DELETE FROM bulletins WHERE id = "+row.getResultByName("id"));
					deletecommand.executeAsync(this._ignoreResponse);
				} //if(!found)
			} //for(let row = 
		},
		handleError: function(aError) {
			dump("TODO, BETTER HANDLING FOR THIS: "+ aError.message);
		},
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
				dump("TODO, BETTER THING TO DO, THINK Query canceled or aborted!");
			} else {
				//now, add bulletins we didn't catch
				//needs to be here instead of handleResult since handleResult is not called if the table is empty
				sbarr.forEach(function(e,i,a) {
					let createcommand = ExtChiBusTrackSBStore.dbcon.createStatement("INSERT INTO bulletins (name, rt, subject, details, system, ignored) VALUES ( :name , :rt, :subject, :details, 'CTA' , 'false' )");
					createcommand.params.name = e.name;
					createcommand.params.rt = e.rt;
					createcommand.params.subject = e.subject;
					createcommand.params.details = e.details;
					createcommand.executeAsync(this._ignoreResponse);
				});
			}
		}
	});

},

//returns true or false depending if we should ignore this sb
ignored: function(sbname,callback) {
	let countstmt = this.dbcon.createStatement("SELECT COUNT(*) FROM bulletins WHERE system='CTA' AND name=:sbname AND ignored='true'");
	countstmt.params.sbname = sbname;
	let returnvalue = false;
	countstmt.executeAsync({
		handleResult: function(aResultSet) {
			callback(aResultSet.getNextRow().getResultByIndex(0) != 0)
		},
		handleError: function(aError) {
			dump("TODO, BETTER HANDLING FOR THIS: "+ aError.message);
		},
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
				dump("TODO, BETTER THING TO DO, THINK Query canceled or aborted!");
			}
		}
	});
},

setIgnore: function(sbname, ignore) {
	//maybe we should check that sbname actually exists in db?
	//just to be safe, make sure only true/false are added to db
	let upstmt = this.dbcon.createStatement("UPDATE bulletins SET ignored="+(ignore?"'true'":"'false'")+" WHERE system='CTA' AND name=:sbname");
	upstmt.params.sbname = sbname;
	upstmt.executeAsync({
		handleResult: function(aResultSet) {
			//nothing happens here....
		},
		handleError: function(aError) {
			dump("TODO, BETTER HANDLING FOR THIS: "+ aError.message);
		},
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
				dump("TODO, BETTER THING TO DO, THINK Query canceled or aborted!");
				return;
			}
			//use our callbacks
			for(var callbackname in ExtChiBusTrackSBStore.handlers) {
				var callback = ExtChiBusTrackSBStore.handlers[callbackname];
				callback();
			};
		}
	});
},

//handler stuff
addHandler: function(parentwindow, callback) { //callback should take prefname as single argument
	//give reasonably random name
	let name = "";
	do {name = (((1+Math.random())*0x100000000)|0).toString(32).substring(1)}
		while(typeof this.handlers[name] != "undefined"); //ensure unique
	this.handlers[name] = callback;
	//remove when done
	parentwindow.addEventListener("unload", function() {
		ExtChiBusTrackSBStore.removeHandler(name); },false);
},

removeHandler: function(name) {
	if(this.handlers[name]) delete this.handlers[name];
},

};

ExtChiBusTrackSBStore.init(); //always load up db
