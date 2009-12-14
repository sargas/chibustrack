all: tmp/chibustrack.xpi

tmp/chibustrack.xpi: AUTHORS chrome/ chrome.manifest defaults/ icon.png install.rdf modules/
	[ -d tmp/ ] || mkdir tmp/
	zip -r tmp/chibustrack.xpi AUTHORS chrome/ chrome.manifest defaults/ icon.png install.rdf modules/

clean:
	rm tmp/chibustrack.xpi
