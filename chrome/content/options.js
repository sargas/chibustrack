window.addEventListener("load",function () {
	ExtCtaChecker._routetomenu = new XSLTProcessor();

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
	ExtCtaChecker.loadroutes();
},false);
