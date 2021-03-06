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

//load prefs
Components.utils.import("resource://chibustrack/prefs.js");
//load our cache of SB's
Components.utils.import("resource://chibustrack/sbstore.js");

var ExtChiBusTrack = {
	_styles: new Array(), //hold the xslt stylesheets

	_cache: new Array(), // holds cache-ing info

	_sbnum: null, //random number to fight race conditions
	_stpnum: null, //yet again, needs to be in global scope (relatively speaking)

	sbtimer: null, //id of timer
	loadCTAData: function(verb,callback,params,ignoreErr) { //simplified $.get
		//callback if a function of a document object for the XML response
		//params is optional
		//ignoreErr means the callback will (hopefully) take care of it
		var xhr = new XMLHttpRequest();
		var args = "";
		if(!navigator.onLine) {
			//eck....okay, we silently fail/hang for now.
			//Could be worse, this is probably one of the least annoying thats to do
			return;
		}

		/* Need to paramaterize params
		 * adapted from jQuery code (1.3.2) */
		if (params) {
			var s = [];
			for (var j in params)
				s[s.length] = encodeURIComponent(j) + '=' + encodeURIComponent(params[j]);
			args = "&" + s.join("&").replace(/%20/g, "+");
		}
		var url = "http://www.ctabustracker.com/bustime/api/v1/"+verb+"?key=HeDbySM4CUDgRDsrGnRGZmD6K"+args;
		xhr.onreadystatechange  = function() {
			if(xhr.readyState  == 4) {
				if(xhr.status  == 200) {
					var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
						.createInstance(Components.interfaces.nsIDOMParser);
					var doc = parser.parseFromString(xhr.responseText, "text/xml");
					var xpathexpr = doc.createExpression("bustime-response/error",null);
					if(!ignoreErr && xpathexpr.evaluate(doc,XPathResult.BOOLEAN_TYPE,null).booleanValue) {
						xpathexpr = doc.createExpression("bustime-response/error/msg",null);
						var serializer = new XMLSerializer();
						window.openDialog("chrome://chibustrack/content/core/error.xul","",
								"chrome,dialog,resizable=yes,scrollbars",
								xpathexpr.evaluate(doc,XPathResult.STRING_TYPE,null).stringValue,
								serializer.serializeToString(doc),
								url).focus();
					} else {
						callback(doc,params);
					}
				} else {
					alert("Sorry, but Chicago Bus Tracker has obtained XMLHttpRequest Error code " + xhr.status);
				}
			}
		}


		xhr.open("GET",url,true);xhr.send(null);
		if(false) dump(url+"\n");
	},
	resetSBTimer: function() {
		ExtChiBusTrack.reloadSBCache();
		if(ExtChiBusTrack.sbtimer) window.clearInterval(ExtChiBusTrack.sbtimer);
		ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.reloadSBCache,
			ExtChiBusTrackPrefs.sbinterval*60*1000);
	},
	reloadSBCache: function() {
		let routes = ExtChiBusTrackPrefs.bullroutes.split(';');
		for(let j=0;j<routes.length;++j) if(routes[j] != "")
		ExtChiBusTrack.loadCTAData("getservicebulletins",function(doc,params) { //need original route
			if (doc.documentElement.childElementCount == 0) return; // nothing to report :)
			
			//we got atleast one service bulletin...
			let sb = doc.documentElement.children;

			let temparr = new Array();
			for (let i = 0; i < sb.length; i++) {
				temparr.push({
					name: sb[i].getElementsByTagName("nm")[0].textContent,
					rt: params.rt,
					subject: sb[i].getElementsByTagName("sbj")[0].textContent,
					details: sb[i].getElementsByTagName("dtl")[0].textContent.replace(/<br.>/g,"\n"),
				});
			}

			//now add them directly to the cache
			ExtChiBusTrackSBStore.refreshSBs(params.rt,temparr);
		},{rt: routes[j]});
	},
	removeStop: function (e) { //used in mobile and firefox
		var selstops = document.getElementById("chibustrack-selstops");
		if(selstops.selectedItem == null) return;
		var prefid = selstops.selectedItem.getAttribute("value");

		ExtChiBusTrackPrefs.removeStop(prefid);
	},
	toggleFromList: function(listboxid,buttonid) { //buttonid is enabled if theres a selection in listboxid
		var box = document.getElementById(listboxid);
		var button = document.getElementById(buttonid);
		if(box.selectedCount > 0) {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
	},
};
