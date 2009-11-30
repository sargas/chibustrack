all: tmp/chibustrack.xpi

tmp/chibustrack.xpi: chrome/ defaults/ chrome.manifest install.rdf
	zip -r tmp/chibustrack.xpi chrome chrome.manifest defaults install.rdf

clean:
	rm tmp/chibustrack.xpi
