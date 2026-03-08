version := $(shell jq -r '.version' src/manifest.json)
safari_project := KudoAllSafari/KudoAll.xcodeproj
safari_pbxproj := KudoAllSafari/KudoAll.xcodeproj/project.pbxproj
safari_scheme := Garmin Connect Web Kudo All (macOS)
safari_derived_data := /tmp/KudoAllDerivedData
safari_archive_tmp := /tmp/GarminConnectWebKudoAll-$(version).xcarchive
safari_app_src := /tmp/KudoAllDerivedData/Build/Products/Release/Garmin Connect Web Kudo All.app
safari_app_dst := build/artefacts/Garmin Connect Web Kudo All-$(version)-unsigned.app
safari_archive_dst := build/artefacts/GarminConnectWebKudoAll-$(version)-unsigned.xcarchive

.PHONY: prepare
prepare:
	mkdir -p build/temp
	mkdir -p build/artefacts
	ls .
	rm -rf build/temp/*
	cp -r src/* build/temp
	find build/temp -name '.DS_Store' -delete

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

.PHONY: safari.sync-version
safari.sync-version:
	perl -0pi -e 's/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = $(version);/g; s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = $(version);/g' $(safari_pbxproj)

.PHONY: build.safari.macos
build.safari.macos: prepare zip safari.sync-version
	rm -rf "$(safari_derived_data)"
	rm -rf "$(safari_app_dst)"
	xcodebuild -project "$(safari_project)" -scheme "$(safari_scheme)" -configuration Release -derivedDataPath "$(safari_derived_data)" CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
	cp -R "$(safari_app_src)" "$(safari_app_dst)"

.PHONY: archive.safari.macos
archive.safari.macos: prepare zip safari.sync-version
	rm -rf "$(safari_derived_data)"
	rm -rf "$(safari_archive_tmp)"
	rm -rf "$(safari_archive_dst)"
	xcodebuild -project "$(safari_project)" -scheme "$(safari_scheme)" -configuration Release -derivedDataPath "$(safari_derived_data)" -archivePath "$(safari_archive_tmp)" CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO archive
	cp -R "$(safari_archive_tmp)" "$(safari_archive_dst)"
