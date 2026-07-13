version := $(shell jq -r '.version' src/manifest.json)
safari_build_number ?= 6
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
	xattr -dr com.apple.quarantine build/temp 2>/dev/null || true

chrome:
	python3 fix-manifest-version.py

firefox:
	python3 fix-firefox-manifest.py

safari:
	python3 fix-safari-manifest.py

.PHONY: zip
zip:
	cd build/temp && zip -rv kudoall.zip .
	zip -T build/temp/kudoall.zip

build.chrome: prepare chrome zip
	cp build/temp/kudoall.zip build/artefacts/kudoall-chrome-${version}.zip

dev.chrome: prepare chrome

build.firefox: prepare firefox zip
	cp build/temp/kudoall.zip build/artefacts/kudoall-firefox-${version}.zip

.PHONY: safari.sync-version
safari.sync-version:
	perl -0pi -e 's/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = $(version);/g; s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = $(safari_build_number);/g' $(safari_pbxproj)

.PHONY: safari.clear-quarantine
safari.clear-quarantine:
	xattr -dr com.apple.quarantine src 2>/dev/null || true
	xattr -dr com.apple.quarantine "KudoAllSafari/Shared (App)" 2>/dev/null || true
	xattr -dr com.apple.quarantine "KudoAllSafari/Shared (Extension)" 2>/dev/null || true
	xattr -dr com.apple.quarantine "KudoAllSafari/macOS (App)" 2>/dev/null || true
	xattr -dr com.apple.quarantine "KudoAllSafari/macOS (Extension)" 2>/dev/null || true

.PHONY: build.safari.macos
build.safari.macos: prepare safari zip safari.sync-version safari.clear-quarantine
	rm -rf "$(safari_derived_data)"
	rm -rf "$(safari_app_dst)"
	xcodebuild -project "$(safari_project)" -scheme "$(safari_scheme)" -configuration Release -derivedDataPath "$(safari_derived_data)" CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
	xattr -dr com.apple.quarantine "$(safari_app_src)" 2>/dev/null || true
	cp -R "$(safari_app_src)" "$(safari_app_dst)"
	xattr -dr com.apple.quarantine "$(safari_app_dst)" 2>/dev/null || true

.PHONY: archive.safari.macos
archive.safari.macos: prepare safari zip safari.sync-version safari.clear-quarantine
	rm -rf "$(safari_derived_data)"
	rm -rf "$(safari_archive_tmp)"
	rm -rf "$(safari_archive_dst)"
	xcodebuild -project "$(safari_project)" -scheme "$(safari_scheme)" -configuration Release -derivedDataPath "$(safari_derived_data)" -archivePath "$(safari_archive_tmp)" CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO archive
	xattr -dr com.apple.quarantine "$(safari_archive_tmp)" 2>/dev/null || true
	cp -R "$(safari_archive_tmp)" "$(safari_archive_dst)"
	xattr -dr com.apple.quarantine "$(safari_archive_dst)" 2>/dev/null || true
