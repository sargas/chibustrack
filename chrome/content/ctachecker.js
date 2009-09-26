var ExtCtaChecker = {
	_routetomenu: null, //just passing around a variable
	route: null, //current route
	sbinterval: null, //interval for service bullintin timer
	sbtimer: null, //id of timer
	prefs: null,
	load: function() {
		//load prefs
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.ctachecker.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

		this.route = this.prefs.getCharPref("route");
		this.sbinterval = this.prefs.getIntPref("sbinterval");
	},
	unload: function() {
		this.prefs.removeObserver("", this);
	},
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
		this.loadCTAData("getroutes",function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response, "text/xml");
			var routes = ExtCtaChecker._routetomenu.transformToDocument(doc);
			var menulist = document.getElementById("ctaroutes");
			menulist.appendChild(routes.documentElement);

			//got to reload the setting for some reason...
			//perhaps preferences system doesn't work dynamically
			//generated like this
			var curRoute = document.getElementById("CTARoute"+ExtCtaChecker.route);
			var realmenulist = document.getElementById("CTARouteChooser");
			realmenulist.selectedItem = curRoute;
		});
	},
	loadstatusbar: function() {
		ExtCtaChecker.loadCTAData("getservicebulletins",function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response, "text/xml");
			var panel = document.getElementById("ctachecker-panel");
			if (doc.documentElement.childElementCount == 0) {
				panel.setAttribute("label","No Bulletins for route "+ExtCtaChecker.route);
				panel.removeAttribute("tooltiptext");
				return;
			}
			//we got atleast one service bulletin...
			var sb = doc.documentElement.children;
			for (var i = 0; i < sb.length; i++) {
				var name = sb[i].getElementsByTagName("nm")[0].textContent;
				var subject = sb[i].getElementsByTagName("sbj")[0].textContent;
				var details = sb[i].getElementsByTagName("dtl")[0].textContent;
				//try to match <br/> without using /
				details = details.replace(/<br.>/g,"\n");
				panel.setAttribute("label",name+" - "+subject);
				panel.setAttribute("tooltiptext",details);
			}
		},{rt: ExtCtaChecker.route});
	},
	observe: function (subject, topic, data) {
		if (topic != "nsPref:changed") return;
		switch(data) {
			case "route":
				this.route = this.prefs.getCharPref("route");
				this.loadstatusbar();
				break;
			case "sbinterval":
				this.sbinterval = this.prefs.getIntPref("sbinterval");
				window.clearInterval(this.sbtimer);
				ExtCtaChecker.sbtimer = window.setInterval(ExtCtaChecker.loadstatusbar,this.sbinterval*60*1000);
				break;
		}
	},
};

window.addEventListener("load", function() {
	ExtCtaChecker.load(); },false);
window.addEventListener("unload", function() {
	ExtCtaChecker.unload(); },false);
