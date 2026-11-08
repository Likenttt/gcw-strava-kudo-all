# GCW & Strava Kudo All

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/likenttt/garmin-connect-web-kudo-all-browser-extension?style=for-the-badge&sort=semver)](https://github.com/likenttt/garmin-connect-web-kudo-all-browser-extension/releases/latest)

It's a Chrome/Firefox/Safari Extension to give kudos to your elite athletes friends in one click in [GCW(Garmin Connect Web)](https://connect.garmin.com/app/newsfeed) or [Strava](https://www.strava.com/dashboard)

[🇨🇳 简体中文](./README-zh.md)

<!-- kudo-home-video-preview:start -->
## Video Preview

[Watch the Garmin Connect Web & Strava Kudo All browser extension demo on YouTube.](https://www.youtube.com/watch?v=edJNdPsyp7I)
<!-- kudo-home-video-preview:end -->

## Installation

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/)
- [Google Chrome](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc)
- [Safari for Mac — one-time purchase](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8) · [Features and setup](https://kudoall.li2niu.com/safari/?lang=en)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/gcw-and-strava-kudo-all/lmopbhpibkfcmbgipoalokaemgnlmjdn)
- or Install from [.crx](./crx-files.md)

[![](https://img.shields.io/chrome-web-store/v/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc) [![](https://img.shields.io/chrome-web-store/rating/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc) [![](https://img.shields.io/chrome-web-store/users/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc)

[![](https://img.shields.io/amo/v/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/) [![](https://img.shields.io/amo/rating/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/) [![](https://img.shields.io/amo/users/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/)

[<img src="./screenshots/appstore-badge.png" width="98" height="32" alt="Get Kudo All for Safari on the Mac App Store"/>](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8)

**Using Safari on a Mac?** The Safari edition supports Garmin Connect Web and Strava on macOS 12 or later. It is a one-time App Store purchase, with no subscription (US price: **$2.99**; other regions show their local price in the App Store). [See supported pages and the three setup steps.](https://kudoall.li2niu.com/safari/?lang=en)

## Local testing in EGO

Disable the Web Store copy, open `chrome://extensions/`, enable Developer mode, and load this repository's `src` directory as an unpacked extension. Check that it shows version **1.5**, then refresh Strava. After editing files, reload the extension first and refresh the webpage second.

[EGO debugging and release checklist](./docs/ego-debugging.md) (简体中文).

## FAQ

### Where is the one click button?

- In GCW, it is on the up-right nav bar next to Upload Activities.
- On the Strava dashboard, it is in the upper-right navigation. If the usual feed navigation is unavailable, a floating button appears.
- On either supported Garmin Connect or Strava feed, the browser extension icon opens a panel with the page connection, available kudos and last-run results. It also provides Reconnect and a backup action.

### Valid domains and urls

For GCW, these domains are valid

- https://connect.garmin.com/app/newsfeed
- https://connect.garmin.cn/app/newsfeed
- https://connectus.garmin.cn/app/newsfeed

For Strava, only https://www.strava.com is valid.

### What is the kudos range?

On Garmin Connect and Strava, it gives kudos to eligible activities already loaded in the feed. Scroll to load more, then run it again. It skips activities already given kudos and does not scroll automatically. Result counts reflect the displayed page state.

### What is the points of kudos?

- Spread your love.
- Encourage your elite athletes friends.

### Can you support auto kudo?

Each run starts with your click and processes eligible activities already loaded in the feed. It does not automatically scroll, load more activities or run unlimited background kudos.

## Credit

- [Kudo All for Strava](https://github.com/tciles/kudo-all)
- [Chrome Extension Icon Generator](https://alexleybourne.github.io/chrome-extension-icon-generator/)

<!-- kudo-home-more-apps:start -->
## More Extensions and Apps

- [GameraSnap-Take photos with your Garmin watch](https://gamerasnap.li2niu.com/)
- [More Extensions](https://extensions.li2niu.com)
- [NewQRCode-Bring QRCodes to your Smart Watches](https://q.li2niu.com)
<!-- kudo-home-more-apps:end -->

## Strava Plugin by my friends

[Strava Assistant](https://www.stravassistant.icu)

## Privacy Policy

[Privacy Policy](./privacy-policy.md)
