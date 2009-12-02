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
var ExtChiBusTrack = {
	_styles: new Array(), //hold the xslt stylesheets
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
						window.openDialog("chrome://chibustrack/content/error.xul","",
								"chrome,dialog,resizable=yes",
								xpathexpr.evaluate(doc,XPathResult.STRING_TYPE,null).stringValue,
								serializer.serializeToString(doc)).focus();
					} else {
						callback(doc);
					}
				} else {
					alert("Sorry, but Chicago Bus Tracker has obtained XMLHttpRequest Error code " + xhr.status);
				}
			}
		}

		/* Need to paramaterize params
		 * adapted from jQuery code (1.3.2) */
		if (params) {
			var s = [];
			for (var j in params)
				s[s.length] = encodeURIComponent(j) + '=' + encodeURIComponent(params[j]);
			args = "&" + s.join("&").replace(/%20/g, "+");
		}

		xhr.open("GET","http://www.ctabustracker.com/bustime/api/v1/"+verb+"?key=HeDbySM4CUDgRDsrGnRGZmD6K"+args,
				true);xhr.send(null);
		if(false) alert("http://www.ctabustracker.com/bustime/api/v1/"+verb+"?key=HeDbySM4CUDgRDsrGnRGZmD6K"+args);
	},
	loadstatusbar: function() {
		var statusbar = document.getElementById("status-bar");
		var icon = document.getElementById("chibustrack-icon");

		//rid ourselves of all previous bulletins:
		var oldpanels = document.getElementsByClassName("ctabustrack-bulletins");
		while(oldpanels.length>0) {
			statusbar.removeChild(oldpanels[0]);
		}

		//CTA API docs say the name is unique. Lets hold them to it
		var names = new Array();

		//iterate through each route
		var routes = ExtChiBusTrackPrefs.bullroutes.split(';');
		for(var j=0;j<routes.length;++j)
		if(routes[j] != "")
		ExtChiBusTrack.loadCTAData("getservicebulletins",function(doc) {
			if (doc.documentElement.childElementCount == 0) {
				return; //nothing to report :)
			}
			//we got atleast one service bulletin...
			var sb = doc.documentElement.children;
			for (var i = 0; i < sb.length; i++) {
				var panel = document.createElement("statusbarpanel");
				var name = sb[i].getElementsByTagName("nm")[0].textContent;
				var subject = sb[i].getElementsByTagName("sbj")[0].textContent;
				var details = sb[i].getElementsByTagName("dtl")[0].textContent;

				//Deal with duplicate bulletins the tough way...ignoring them
				if(names.indexOf(name) != -1) continue;
				names.push(name);
				//try to match <br/> without using /
				details = subject+"\n"+details.replace(/<br.>/g,"\n");
				panel.setAttribute("label",name);
				panel.setAttribute("tooltiptext",details);
				panel.className = "ctabustrack-bulletins";
				statusbar.insertBefore(panel,icon);
			}
		},{rt: routes[j]});
	},
	loadBullRoutes: function () {
		var routes = ExtChiBusTrackPrefs.bullroutes.split(';').sort(function(a,b) {return parseInt(a)-parseInt(b);});
		var selbullroutes = document.getElementById("selbullroutes");
		
		//clear the routes
		while(selbullroutes.firstChild) selbullroutes.removeChild(selbullroutes.firstChild);

		//re-add them (if any)
		for(var i=0;i<routes.length;++i) {
			if(routes[i] == "") continue;
			var newlistitem = document.createElement("listitem");
			newlistitem.setAttribute("label",routes[i]);
			newlistitem.setAttribute("value",routes[i]);
			selbullroutes.appendChild(newlistitem);
			document.getElementById("rmBulBut").setAttribute("disabled",false);
		}
		if(!selbullroutes.hasChildNodes()) {
			document.getElementById("rmBulBut").setAttribute("disabled",true);
		}
	},
	reloadSB: function() {
		ExtChiBusTrack.loadstatusbar();
		window.clearInterval(ExtChiBusTrack.sbtimer);
		ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,
			ExtChiBusTrackPrefs.sbinterval*60*1000);
	},
};
