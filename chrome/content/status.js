window.addEventListener("load", function() {
	ExtCtaChecker.loadstatusbar();
	ExtCtaChecker.sbtimer = window.setInterval(ExtCtaChecker.loadstatusbar,ExtCtaChecker.sbinterval*60*1000);
	ExtCtaChecker.prefs.addObserver("", ExtCtaChecker, false);
},false);

ExtCtaChecker.onclick = function(event) {
	window.openDialog('chrome://ctachecker/content/options.xul','_blank','chrome,all,dialog=no');
};
