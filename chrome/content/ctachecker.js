var ExtCtaChecker = {
	_routetomenu: null, //just passing around a variable
	sbtimer: null, //id of timer
	loadCTAData: function(verb,callback,params) { //simplified $.get
		var xhr = new XMLHttpRequest();
		var args = "";
		xhr.onreadystatechange  = function() {
			if(xhr.readyState  == 4) {
				if(xhr.status  == 200) {
					callback(xhr.responseText);
				} else {
					alert("Error code " + xhr.status);
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
	},
	loadroutes: function() {
		//populate the little drop down box when adding routes
		this.loadCTAData("getroutes",function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response, "text/xml");
			var routes = ExtCtaChecker._routetomenu.transformToDocument(doc);
			var menulist = document.getElementById("bullroutes");
			routes.firstChild.addEventListener("command",ExtCtaChecker.addBullRoute,false);
			menulist.appendChild(routes.documentElement);
		});
	},
	loadstatusbar: function() {
		var statusbar = document.getElementById("status-bar");
		var icon = document.getElementById("ctachecker-icon");

		//rid ourselves of all previous bulletins:
		var oldpanels = document.getElementsByClassName("ctachecker-bulletins");
		while(oldpanels.length>0) {
			statusbar.removeChild(oldpanels[0]);
		}

		//iterate through each route
		var routes = ExtCtaCheckerPrefs.bullroutes.split(';');
		for(var j=0;j<routes.length;++j)
		ExtCtaChecker.loadCTAData("getservicebulletins",function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response, "text/xml");

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
				//try to match <br/> without using /
				details = subject+"\n"+details.replace(/<br.>/g,"\n");
				panel.setAttribute("label",name);
				panel.setAttribute("tooltiptext",details);
				panel.className = "ctachecker-bulletins";
				statusbar.insertBefore(panel,icon);
			}
		},{rt: routes[j]});
	},
	loadBullRoutes: function () {
		var routes = ExtCtaCheckerPrefs.bullroutes.split(';').sort(function(a,b) {return parseInt(a)-parseInt(b);});
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
	addBullRoute: function (e) { //e is an oncommand event
		if (e.target.getAttribute("value") != "--") { //skip adding --
			//worry about duplicates....
			if(ExtCtaCheckerPrefs.bullroutes.split(';').indexOf(e.target.getAttribute("value")) == -1)
			ExtCtaCheckerPrefs.prefs.setCharPref("bullroutes",ExtCtaCheckerPrefs.bullroutes + ";" + e.target.getAttribute("value"));
		}
		//always do this, even if selected --
		document.getElementById("addbulletin").hidePopup();
	},
	removeBullRoute: function (e) {
		var selbullroutes = document.getElementById("selbullroutes");
		if(selbullroutes.selectedItem == null) return;
		var route = selbullroutes.selectedItem.getAttribute("value");

		//might as well sort the list in the prefs while we're at it
		var routes = ExtCtaCheckerPrefs.bullroutes.split(';').sort(function(a,b) {return parseInt(a)-parseInt(b);});
		var newroutes = new Array();

		for(var i=0;i<routes.length;++i) {
			if(routes[i] != route && routes[i] != "") newroutes.push(routes[i]);
		}
		ExtCtaCheckerPrefs.prefs.setCharPref("bullroutes",newroutes.join(";"));
	},
};
