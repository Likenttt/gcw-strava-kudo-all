---
layout: safari-guide
title: Kudo All for Safari — User Guide
lang: en
permalink: /help/safari/
---

# Kudo All for Safari: installation and first use

[简体中文](https://kudoall.li2niu.com/help/safari/zh/) · [Features and demo](https://kudoall.li2niu.com/safari/)

Kudo All gives kudos to eligible activities already loaded in your Garmin Connect or Strava feed. The Safari edition requires a **Mac running macOS 12 or later**. It is a **one-time Mac App Store purchase, with no subscription**; check your local store for the current price. This edition runs in Safari on Mac, not on iPhone or iPad.

## 1. Download and open the Mac app

1. Open the [official Kudo All Mac App Store page](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8) on your Mac.
2. Check the price, purchase and install the app using your Apple Account.
3. Click **Open** in the App Store, or open **Garmin Connect Web Kudo All** from **Finder → Applications**, once after installation. This is the containing Mac app for the **Kudo All: Strava & Garmin** Safari extension. Its setup window helps you enable the extension; the actual kudos action happens on the website in Safari.

## 2. Enable the Safari extension

1. Open Safari. In the Mac menu bar, choose **Safari → Settings**; on older versions choose **Safari → Preferences**.
2. Open **Extensions**, select **Kudo All: Strava & Garmin**, and tick its checkbox. Names may differ with the interface language or an older app version. Confirm Safari's prompt if one appears.
3. You can also use the Mac app's **Open Safari Settings** button to reach this screen (**Open Safari Preferences** on older macOS versions).

<figure>
  <img src="https://kudoall.li2niu.com/assets/images/safari-guide/enable-extension.jpg" width="1672" height="1200" style="max-width:100%;height:auto;" loading="lazy" alt="Actual Safari Extensions settings with Kudo All: Strava &amp; Garmin selected and enabled.">
  <figcaption>Actual Safari Settings → Extensions. Names and layout vary by language and version. The private-browsing permission shown here is optional; regular Safari windows do not require it.</figcaption>
</figure>

The Mac app's enabled status checks the extension switch. You still need website access and a signed-in feed in the following steps. Apple's [Safari extension instructions](https://support.apple.com/en-us/102343) cover these Safari controls.

## 3. Allow access to the websites you use

1. Open your Garmin Connect or Strava website in Safari.
2. Return to **Safari → Settings → Extensions**, select Kudo All, and open **Edit Websites** or the website access control shown by your Safari version.
3. Set the site you use to **Allow**. If Safari asks when you click the extension icon, choose **Always Allow on This Website** for that site. You can leave other websites set to **Ask** or **Deny**; you do not need to allow every website.

For example, using international Garmin Connect needs `connect.garmin.com`; using Garmin China needs `connect.garmin.cn` or `connectus.garmin.cn`, according to your account. For Strava, allow `www.strava.com` (or `strava.com` if that is the address Safari displays). Allow each site separately if you use both services. Access lets the extension add its button and interact with the feed's kudos controls.

## 4. Sign in and open a supported feed

Sign in to your existing Garmin or Strava account in Safari, then open your feed:

| Service | Feed |
| --- | --- |
| Garmin Connect — international | [connect.garmin.com/app/newsfeed](https://connect.garmin.com/app/newsfeed) |
| Garmin Connect — China | [connect.garmin.cn/app/newsfeed](https://connect.garmin.cn/app/newsfeed) |
| Garmin Connect — China, connectus | [connectus.garmin.cn/app/newsfeed](https://connectus.garmin.cn/app/newsfeed) |
| Strava | [www.strava.com/dashboard](https://www.strava.com/dashboard) |

Garmin's older `/modern/newsfeed` route is also supported. An account profile, individual activity or login page is not the feed.

After enabling or updating the extension, or changing website access, **refresh the feed with ⌘R** and wait for activities to load.

## 5. Give kudos and check the result

- **On the page:** Garmin's heart-shaped **Kudo All** action appears near the upload action in the upper-right navigation. Strava's appears in the upper-right navigation. A floating button is used when the usual navigation is unavailable.
- **In Safari's toolbar:** click the Kudo All extension icon to open its panel. Check that **Page connection** reads **Connected**. **Available kudos** shows how many eligible, unliked activities are loaded; a positive count means there are activities to process. The panel also shows **Running**, **Last run: page confirmed**, and **Last run: unconfirmed**. If the icon is hidden, use **View → Customize Toolbar** to add it.
- If the panel says **Disconnected**, click **Reconnect**, then check that the connection and available count update. Reconnect loads the extension into the current supported page; it does not give kudos by itself.
- When you are ready, click **Kudo All** on the page or **Give kudos to current feed** in the panel. Keep the feed open while the run finishes; you can close and reopen the panel to check progress.

**Last run: page confirmed** means the activity's displayed kudos state changed and remained confirmed on the page. It is not a separate server receipt. If a kudo is unconfirmed, the run stops and skips the remaining activities; check the page and connection before trying again. Refreshing the feed clears the previous page session's result counts.

Each click processes eligible, unliked activities **already loaded in the feed**, including cards outside the current viewport. It skips activities already given kudos. Scroll to load more, then click again. Kudo All does not scroll automatically, load the entire history or start unlimited background kudos.

### Strava: use the page button or toolbar panel

1. **Sign in to Strava in Safari**, then open the [Strava dashboard](https://www.strava.com/dashboard) and refresh it. Signing in with another browser does not sign you in to Safari.
2. Find **Kudo All** in the page's upper-right navigation, or open the Kudo All icon in Safari's toolbar. In the panel, check **Connected** and **Available kudos**. If disconnected, choose **Reconnect** first.
3. Click the page button or **Give kudos to current feed** in the panel. Keep the dashboard open, then check the activity kudos icons and the panel's last-run counts. This run covers eligible activities already loaded in the current feed; scroll to load more before starting another run.

<figure>
  <img src="https://kudoall.li2niu.com/assets/images/safari-guide/strava-feed.png" width="1248" height="880" style="max-width:100%;height:auto;" loading="lazy" alt="Real Strava dashboard in Chromium/EGO with the orange Kudo All button in the upper-right navigation; personal details are blurred.">
  <figcaption>Real Chromium/EGO demonstration before a run, showing the orange Kudo All page button. Personal information is blurred. For Safari, complete the Safari website-access and sign-in steps above.</figcaption>
</figure>

## Common questions

### The app is installed, but there is no button

Open the Mac app once, check **Safari → Settings → Extensions**, and allow access to the exact domain shown in Safari's address bar. Open a feed from the table above, sign in and refresh it. If the panel is disconnected, use **Reconnect**. You can also run from the toolbar panel when the page button is unavailable.

If Kudo All is missing from the Extensions list, finish installation in the Mac App Store, open the installed app, then quit and reopen Safari. The app must remain installed for its extension to be available.

### The panel asks me to open a supported feed

Switch to the Garmin newsfeed or Strava dashboard tab before opening the panel. It reads the currently active Safari tab. Individual activity pages and other websites are unsupported.

### Available kudos is zero, or the run button is disabled

Check that you are signed in and the feed has finished loading. Loaded activities may already have kudos or be ineligible. Scroll to load more and reopen the panel. The action is also disabled while a run is in progress or the page is disconnected.

### Reconnect fails, or the run reports unconfirmed kudos

Check the site's website access setting, your sign-in and connection, then refresh the feed and try **Reconnect** again. Read the panel's message and inspect the activity's kudos icon before starting another run. If the site has changed its layout, check the Mac App Store for an update.

### It works in one Safari window but not another

For Safari profiles, enable the extension for the profile you use. On versions with a separate private-browsing permission, allow Kudo All in private browsing if you want to use that window, or use a regular Safari window. See Apple's [profile and private-browsing instructions](https://support.apple.com/en-us/102343).

## Turn off or uninstall

To pause use, open **Safari → Settings (or Preferences) → Extensions** and clear Kudo All's checkbox. You can also revoke access to an individual website. Refresh open feeds to remove the page button.

To remove it, select Kudo All in the same Extensions screen, click **Uninstall**, and follow Safari's prompt to remove the containing Mac app. See Apple's [extension removal instructions](https://support.apple.com/en-us/102343).

[Privacy policy](https://kudoall.li2niu.com/privacy-policy.html) · [Product website](https://kudoall.li2niu.com/safari/)
