all: tmp/chibustrack.xpi

tmp/chibustrack.xpi: chrome/ defaults/ chrome.manifest install.rdf
	[ -d tmp/ ] || mkdir tmp/
	zip -r tmp/chibustrack.xpi chrome chrome.manifest defaults icon.png install.rdf modules

clean:
	rm tmp/chibustrack.xpi
