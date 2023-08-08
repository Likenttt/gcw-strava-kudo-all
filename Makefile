version = `jq -r '.version' src/manifest.json`
.PHONY: prepare
prepare:
	mkdir -p build/temp
	mkdir -p build/artefacts
	ls .
	rm -rf build/temp/*
	cp -r src/* build/temp

chrome:
	python3 fix-manifest-version.py

.PHONY: zip
zip:
	cd build/temp && zip -rv kudoall.zip .
	zip -T build/temp/kudoall.zip

build.chrome: prepare chrome zip
	cp build/temp/kudoall.zip build/artefacts/kudoall-chrome-${version}.zip

dev.chrome: prepare chrome

build.firefox: prepare zip
	cp build/temp/kudoall.zip build/artefacts/kudoall-firefox-${version}.zip
