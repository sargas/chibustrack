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

	ExtChiBusTrackPrefs.load(function(data) {
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
		document.getElementById("rmStop").setAttribute("disabled",false);
	});
	if(!selstops.hasChildNodes()) {
		document.getElementById("rmStop").setAttribute("disabled",true);
	}
};
ExtChiBusTrack.removeBullRoute = function (e) {
	if(document.getElementById("selbullroutes").selectedItem == null) return;
	ExtChiBusTrackPrefs.removeBullRoute(document.getElementById("selbullroutes").selectedItem.getAttribute("value"));
};
