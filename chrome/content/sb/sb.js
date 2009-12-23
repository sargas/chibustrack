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

function setIgnore(e) {
	//e gives us a path into the dom
	//from that we must gain everything we need
	let sbname = e.target.parentNode.querySelector("label.sbname").value;
	let system = "CTA";
	let ignored = e.target.checked
	ExtChiBusTrackSBStore.setIgnore(sbname,ignored);
}
ExtChiBusTrackSBStore.addHandler(window,function() {document.getElementById("sbrows").builder.rebuild()});
ExtChiBusTrackPrefs.addHandler(window,function(data) {if(data == "bullroutes") document.getElementById("sbrows").builder.rebuild();});

