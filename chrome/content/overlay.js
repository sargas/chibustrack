var ExtCtaChecker = {
	_routetomenu: null, //just passing around a variable
	route: null, //current route
	sbinterval: null, //interval for service bullintin timer
	sbtimer: null, //id of timer
	prefs: null,
	load: function() {
		this._routetomenu = new XSLTProcessor();
		// from mdc
		var theTransform = document.implementation.createDocument("", "test", null);
		// just an example to get a transform into a script as a DOM
		// XMLDocument.load is asynchronous, so all processing happens in the 
		// onload handler

		//initialize the xlst stylesheet.
		//Needed to be done right away to avoid a race condition
		theTransform.addEventListener("load", function() {
			ExtCtaChecker._routetomenu.importStylesheet(theTransform);
		}, false);
		theTransform.load("chrome://ctachecker/content/routetomenu.xslt");

		//load prefs
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("ctachecker.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

		this.route = this.prefs.getCharPref("route");
		this.sbinterval = this.prefs.getIntPref("sbinterval");
	},
	unload: function() {
		this.prefs.removeObserver("", this);
	},
	loadCTAData: function(verb,callback,params) {
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
	getdate: function() {
		this.loadCTAData("gettime",function (a) alert(a));
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
	setupstatusbar: function() {
		ExtCtaChecker.loadstatusbar();
		ExtCtaChecker.sbtimer = window.setInterval(ExtCtaChecker.loadstatusbar,this.sbinterval*60*1000);
		ExtCtaChecker.prefs.addObserver("", ExtCtaChecker, false);
	},
	loadstatusbar: function() {
		this.loadCTAData("getservicebulletins",function(response) {
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
	onclick: function(event) {
		 window.openDialog('chrome://ctachecker/content/options.xul','_blank','chrome,all,dialog=no');
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
