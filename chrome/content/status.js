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
			case "bullroutes":
				ExtChiBusTrack.loadstatusbar();
				break;
			case "sbinterval":
				window.clearInterval(ExtChiBusTrack.sbtimer);
				ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,
					ExtChiBusTrackPrefs.sbinterval*60*1000);
				break;
		}
	});
	ExtChiBusTrack.loadstatusbar();
	ExtChiBusTrack.sbtimer = window.setInterval(ExtChiBusTrack.loadstatusbar,ExtChiBusTrackPrefs.sbinterval*60*1000);
},false);

ExtChiBusTrack.onclick = function(event) {
	window.openDialog('chrome://chibustrack/content/options.xul','_blank','chrome,all,dialog=no');
};
