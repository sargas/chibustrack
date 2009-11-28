window.addEventListener("load", function() {
	ExtCtaCheckerPrefs.load(function(data) {
		switch(data) {
			case "bullroutes":
				ExtCtaChecker.loadstatusbar();
				break;
			case "sbinterval":
				window.clearInterval(ExtCtaChecker.sbtimer);
				ExtCtaChecker.sbtimer = window.setInterval(ExtCtaChecker.loadstatusbar,
					ExtCtaCheckerPrefs.sbinterval*60*1000);
				break;
		}
	});
	ExtCtaChecker.loadstatusbar();
	ExtCtaChecker.sbtimer = window.setInterval(ExtCtaChecker.loadstatusbar,ExtCtaCheckerPrefs.sbinterval*60*1000);
},false);

ExtCtaChecker.onclick = function(event) {
	window.openDialog('chrome://ctachecker/content/options.xul','_blank','chrome,all,dialog=no');
};
