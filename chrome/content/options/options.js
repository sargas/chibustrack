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
window.addEventListener("load",function () {

	ExtChiBusTrackPrefs.addHandler(window,function(data) {
		switch(data) {
		case "bullroutes":
			ExtChiBusTrack.loadBullRoutes();
			break;
		case "stops":
			ExtChiBusTrack.loadStops();
			break;
		}
	});

	//load from prefs
	ExtChiBusTrack.loadBullRoutes();
	ExtChiBusTrack.loadStops();
},false);

ExtChiBusTrack.addStop = function (e) {
	openDialog("chrome://chibustrack/content/options/newStop.xul","","dependent,dialog,modal");
};
ExtChiBusTrack.addBull = function (e) {
	openDialog("chrome://chibustrack/content/options/newBull.xul","","dependent,dialog,modal");
};
ExtChiBusTrack.loadStops = function () {
	var selstops = document.getElementById("chibustrack-selstops");
	
	//clear the routes
	while(selstops.firstChild) selstops.removeChild(selstops.firstChild);

	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		var newlistitem = document.createElement("listitem");
		newlistitem.setAttribute("label","Route "+e.rt+", "+e.dir+": "+e.stpnm);
		newlistitem.setAttribute("value",e.prefid);
		selstops.appendChild(newlistitem);
	});
	ExtChiBusTrack.toggleFromList('chibustrack-selstops','rmStop');
};
ExtChiBusTrack.removeBullRoute = function (e) {
	if(document.getElementById("selbullroutes").selectedItem == null) return;
	ExtChiBusTrackPrefs.removeBullRoute(document.getElementById("selbullroutes").selectedItem.getAttribute("value"));
	ExtChiBusTrack.toggleFromList("selbullroutes","rmBulBut");
};
ExtChiBusTrack.loadBullRoutes = function () {
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
	}
	ExtChiBusTrack.toggleFromList("selbullroutes","rmBulBut");
};
