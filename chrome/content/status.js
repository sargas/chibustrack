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
	ExtChiBusTrackPrefs.addHandler(window,function(data) {
		switch(data) {
			case "sbdisplay":
				ExtChiBusTrack.showSB();
				break;
			case "sbinterval":
				ExtChiBusTrack.resetSBTimer();
				break;
			case "bullroutes":
				ExtChiBusTrack.reloadSBCache();
				break;
			case "showInTools":
				document.getElementById("chibustrack-menu").setAttribute("collapsed",!ExtChiBusTrackPrefs.showInTools);
				break;
		}
	});
	ExtChiBusTrackSBStore.addHandler(window,function() {ExtChiBusTrack.showSB()});
	document.getElementById("chibustrack-menu").setAttribute("collasped",!ExtChiBusTrackPrefs.showInTools);
	ExtChiBusTrack.resetSBTimer();

	//load up xslt for route predictions
	ExtChiBusTrack._styles['pred'] = new XSLTProcessor();
	var theTransform = document.implementation.createDocument("", "test", null);
	theTransform.addEventListener("load", function() {
		ExtChiBusTrack._styles['pred'].importStylesheet(theTransform);
	},false);
	theTransform.load("chrome://chibustrack/content/styles/predtobox.xslt");

	//handle our first time ran (running?)
	if(ExtChiBusTrackPrefs.firstrun) {
		gBrowser.addTab("chrome://chibustrack/content/help.xhtml");
		ExtChiBusTrackPrefs.prefs.setBoolPref("firstrun",false);
	}
},false);

ExtChiBusTrack.onclick = function(ev) {
	if(ev.button != 0) return;

	//ah, first run
	if(ExtChiBusTrackPrefs.stops.length == 0) {
		this.onoptionclick(ev);
		return;
	}

	var mystpnum = Math.floor(Math.random()*200);
	ExtChiBusTrack._stpnum = mystpnum;
	//clear em
	var hbox = document.getElementById("chibustrack-panelbox");
	while(hbox.firstChild) hbox.removeChild(hbox.firstChild);

	//show loading...
	document.getElementById("chibustrack-panelload").setAttribute("collapsed",false);
	document.getElementById("chibustrack-panel").openPopup(ev.target,'before_start');

	var rterrors = new Array();
	ExtChiBusTrackPrefs.stops.forEach(function (e,i,a) {
		ExtChiBusTrack.loadCTAData("getpredictions",function(doc) {
			if(ExtChiBusTrack._stpnum != mystpnum) return;
			var box = ExtChiBusTrack._styles['pred'].transformToDocument(doc);
			if(box.documentElement == null) { //no prediction //not an error
				box = document.createElement("vbox");
				var templabel = document.createElement("label");
				templabel.textContent = "Route "+e.rt+ " ("+e.dir + ")";
				var templabel2 = document.createElement("label");
				templabel2.textContent = e.stpnm;
				var templabel3 = document.createElement("label");
				templabel3.textContent = "No Predictions Available";
				box.appendChild(templabel);
				box.appendChild(templabel2);
				box.appendChild(templabel3);
			} else box = box.documentElement; //little hack

			//any errors
			if(box.getElementsByClassName("chibustrack-errors").length != 0) {
				if(rterrors.indexOf(e.rt) == -1) {
					rterrors.push(e.rt);
				} else {
					return;
				}
			}
			hbox.appendChild(box);
			document.getElementById("chibustrack-panelload").setAttribute("collapsed",true);
		},{rt: e.rt, rtdir: e.dir, stpid: e.stpid},true);
	});
};

ExtChiBusTrack.showSB = function() {
	//rid ourselves of any previous bulletins in the statusbar
	let statusbar = document.getElementById("status-bar");
	let oldpanels = document.getElementsByClassName("ctabustrack-bulletins");
	while(oldpanels.length>0) {
		statusbar.removeChild(oldpanels[0]);
	}

	//do we have routes?
	let reloadsb = document.getElementsByClassName("chibustrack-reloadsb");
	let wehavert = (ExtChiBusTrackPrefs.bullroutes.split(";").filter(function(e,i,a) {return (e != "")}).length != 0);
	//only show if we have routes
	for(let i = 0;i<reloadsb.length;++i) reloadsb[i].setAttribute("disabled",!wehavert);
	if(!wehavert) return; //don't bother with the rest if theres nothing to query

	switch (ExtChiBusTrackPrefs.sbdisplay) {
		case 0:
			ExtChiBusTrack.loadSBstatusbar("right");
			break;
		case 1:
			ExtChiBusTrack.loadSBstatusbar("left");
			break;
		case 2:
			ExtChiBusTrack.loadSBGrowl();
			break;
		default:
			//erm.....eck
	}
};

ExtChiBusTrack.loadSBstatusbar = function(position) { //position is either 'left' or 'right'
	let statusbar = document.getElementById("status-bar");
	let icon = document.getElementById("chibustrack-icon");

	var mysbnum = Math.floor(Math.random()*200); //doesn't happen often, so 1/200 chance of collision if does aint bad
	ExtChiBusTrack._sbnum = mysbnum; //kept track of by the object, importantly not local

	//load from cache:
	ExtChiBusTrackSBStore.getAllBulletins(function(bulletins) {
		bulletins.forEach(function(e,i,a) { //yea, a lot of anonymous functions going on
			let panel = document.createElement("statusbarpanel");
			let name = e.name;
			let subject = e.subject;
			let details = e.details;

			//setup tooltip.... this is way too many lines for this
			let tooltip = document.createElement("tooltip");
			let subjectlabel = document.createElement("label");
			subjectlabel.textContent = subject;
			let detaillabel = document.createElement("label");
			//try to match <br/> without using /
			detaillabel.textContent = details;
			subjectlabel.style.fontWeight = "bold";
			tooltip.appendChild(subjectlabel);
			tooltip.appendChild(detaillabel);

			let thelabel = document.createElement("label"); //this is the actual text of the panel
			thelabel.textContent = name;

			//setup ignoring ability
			thelabel.addEventListener("click",function(e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
				if(prompts.confirm(window,"Mark Service Bulletin as Read",
					"Would you like to mark '"+name+"' as read? It will show up again if the alert is repeated"))
					ExtChiBusTrackSBStore.setIgnore(name,true);
			},false);

			panel.setAttribute("tooltip","_child");
			panel.appendChild(thelabel); //must come here instead of label attribute
			panel.appendChild(tooltip); //even though this doesn't show anything
			panel.className = "ctabustrack-bulletins";

			//our last chance to stop...
			if(ExtChiBusTrack._sbnum != mysbnum) return; //looks like we're too late //happens when adding sb's rapidly

			if(position == 'right') statusbar.insertBefore(panel,icon);
			else if(position == 'left')
				statusbar.insertBefore(panel,document.getElementById("statusbar-display"))
		});
	},false);

};

ExtChiBusTrack.loadSBGrowl = function() { //sounds scary
	ExtChiBusTrackSBStore.getAllBulletins(function(bulletins) {
		bulletins.forEach(function(e,i,a) { //yea, a lot of anonymous functions going on
			//load alerts
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);

			alertsService.showAlertNotification("chrome://chibustrack/skin/icon.png",
					e.name,e.details);

			//if we growl it, we only do it once
			ExtChiBusTrackSBStore.setIgnore(e.name,true);
		},false);
	});
};

ExtChiBusTrack.onoptionclick = function(e) {
	window.openDialog('chrome://chibustrack/content/options/options.xul','_blank','chrome,all,dialog=yes');
};

ExtChiBusTrack.onaboutclick = function(e) {
	window.openDialog('chrome://chibustrack/content/about.xul','_blank','chrome,all,dialog=yes');
};

ExtChiBusTrack.onsbclick = function(e) {
	window.openDialog('chrome://chibustrack/content/sb/sb.xul','_blank','chrome,all,dialog=yes');
};
