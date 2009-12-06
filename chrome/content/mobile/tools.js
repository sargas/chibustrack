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
window.addEventListener("load", function() {
	ExtChiBusTrackPrefs.load(function(data) {
		switch(data) {
		case "stops":
			ExtChiBusTrack.loadStops();
			break;
		}
	});
	var panels = document.getElementById("panel-items");
	panels.addEventListener("select",function(e) {
		if (panels.selectedPanel.id == "chibustrack-container") {
			ExtChiBusTrack.loadStops();
		}
	},false);

},false);

ExtChiBusTrack.loadStops = function () { //mobile version :)
	var selstops = document.getElementById("chibustrack-selstops");

	//clear the routes
	while(selstops.firstChild) selstops.removeChild(selstops.firstChild);

	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		var newlistitem = document.createElement("listitem");
		newlistitem.setAttribute("label","Route "+e.rt+", "+e.dir+": "+e.stpnm);
		newlistitem.setAttribute("value",e.prefid);
		selstops.appendChild(newlistitem);
		document.getElementById("chibustrack-rmStop").setAttribute("disabled",false);
	});
	if(!selstops.hasChildNodes()) {
		document.getElementById("chibustrack-rmStop").setAttribute("disabled",true);
	}
};
