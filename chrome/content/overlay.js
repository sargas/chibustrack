var ctachecker = {
	load: function() { },
	unload: function() {},
	loadCTAData: function(verb,callback,params) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange  = function() {
			if(xhr.readyState  == 4)
				if(xhr.status  == 200) {
					callback(xhr.responseText);
				} else {
					alert("Error code " + xhr.status);
				}
		}

		/* Need to paramaterize params
		 * adapted from jQuery code (1.3.2) */
		if (params) {
			var s = [];
			for (var j in params)
				s[s.length] = encodeURIComponent(j) + '=' + encodeURIComponent(params[j]);
			args = s.join("&").replace(/%20/g, "+");
			alert(args);
		}

		xhr.open("GET","http://www.ctabustracker.com/bustime/api/v1/"+verb+"?key=HeDbySM4CUDgRDsrGnRGZmD6K",
				true);xhr.send(null);
	},
	getdate: function(event) {
		this.loadCTAData("gettime",function (a) alert(a));
	},
};

window.addEventListener("load", function() {
		ctachecker.load(); },false);
window.addEventListener("unload", function() {
		ctachecker.unload(); },false);
