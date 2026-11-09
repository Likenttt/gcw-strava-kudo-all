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
- [Safari for Mac — one-time purchase](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8) · [Features and setup](https://kudoall.li2niu.com/safari/)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/gcw-and-strava-kudo-all/lmopbhpibkfcmbgipoalokaemgnlmjdn)
- or Install from [.crx](./crx-files.md)

[![](https://img.shields.io/chrome-web-store/v/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc) [![](https://img.shields.io/chrome-web-store/rating/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc) [![](https://img.shields.io/chrome-web-store/users/folhiecfhnmdniibjjcfogpdoafdamoc.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc)

[![](https://img.shields.io/amo/v/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/) [![](https://img.shields.io/amo/rating/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/) [![](https://img.shields.io/amo/users/kudo-all.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/kudo-all/)

[<img src="./screenshots/appstore-badge.png" width="98" height="32" alt="Get Kudo All for Safari on the Mac App Store"/>](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8)

### Get started with Safari on Mac

The Safari edition requires a **Mac with macOS 12 or later**. It is a one-time Mac App Store purchase with no subscription; the price shown in your local store applies. This edition is for Mac Safari, not iPhone or iPad.

1. [Download Kudo All from the Mac App Store](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8), then open the installed Mac app once.
2. In Safari, choose **Safari → Settings → Extensions** (or **Preferences → Extensions** on older versions), then enable **Kudo All: Strava & Garmin**. Allow the Garmin Connect or Strava site you use; when Safari prompts, choose **Always Allow on This Website**. Access to every website is unnecessary.
3. Sign in to [Garmin Connect](https://connect.garmin.com/app/newsfeed), [Garmin China](https://connect.garmin.cn/app/newsfeed), [Garmin China connectus](https://connectus.garmin.cn/app/newsfeed), or the [Strava dashboard](https://www.strava.com/dashboard), then refresh the page. Click the page's **Kudo All** button, or open its Safari toolbar panel to check available kudos and run it there. Use **Reconnect** if the page is disconnected; reconnecting alone does not start a run.

Read the [complete Safari user guide](./docs/safari-setup.md) ([online version](https://kudoall.li2niu.com/help/safari/)) for website permissions, result counts, troubleshooting and removal. [Safari features and demo](https://kudoall.li2niu.com/safari/).

## FAQ

### Where is the one click button?

- In GCW, look for the heart-shaped Kudo All action in the upper-right navigation next to Upload Activities.
- On the Strava dashboard, it is in the upper-right navigation. If the usual feed navigation is unavailable, a floating button appears.
- On either supported Garmin Connect or Strava feed, the browser extension icon opens a panel with the page connection, available kudos and last-run results. It also provides Reconnect and a backup action.

### Valid domains and urls

For GCW, these domains are valid

- https://connect.garmin.com/app/newsfeed
- https://connect.garmin.cn/app/newsfeed
- https://connectus.garmin.cn/app/newsfeed

For Strava, use https://www.strava.com/dashboard (https://strava.com/dashboard is also supported). Garmin's older `/modern/newsfeed` routes are also supported. Profile and individual activity pages are not supported feeds.

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

## Developer documentation

For local EGO testing, disable the store copy, load the repository's `src` directory as an unpacked extension, and check that its displayed version matches the `version` field in [src/manifest.json](./src/manifest.json). Reload the extension after source changes, then refresh the feed. See the [EGO debugging and release checklist](./docs/ego-debugging.md) (简体中文); use the manifest as the version reference.

EGO unpacked loading, Safari MCP and **Allow Unsigned Extensions** are developer debugging tools. The Mac App Store user setup is described in the Safari guide above.
