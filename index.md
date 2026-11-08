---
layout: default
title: GCW & Strava Kudo All
---

{% include kudo-language-switcher.html %}

<section class="kudo-landing-hero kudo-trilingual">
  <p class="kudo-landing-hero__badge">
    <span class="kudo-l10n--zh" lang="zh-CN">一次点击 · 更多鼓励</span>
    <span class="kudo-l10n--en" lang="en">ONE CLICK · MORE ENCOURAGEMENT</span>
    <span class="kudo-l10n--de" lang="de">EIN KLICK · MEHR ANSPORN</span>
  </p>
  <h1>Kudo All</h1>
  <p class="kudo-landing-hero__copy">
    <span class="kudo-l10n--zh" lang="zh-CN">在 Garmin Connect 与 Strava 上，一次点击为当前动态中的朋友送出鼓励。轻巧、直接，也保留一点点赞的仪式感。</span>
    <span class="kudo-l10n--en" lang="en">Encourage friends across Garmin Connect and Strava with one click—lightweight, direct, and still a little celebratory.</span>
    <span class="kudo-l10n--de" lang="de">Unterstütze deine Freunde auf Garmin Connect und Strava mit einem Klick – schnell, unkompliziert und mit Freude am Sport.</span>
  </p>
  <div class="kudo-landing-hero__actions">
    <a class="kudo-availability-badge" href="https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc">
      <img src="{{ '/assets/icons/chrome.svg' | relative_url }}" alt="" aria-hidden="true" />
      <span class="kudo-availability-badge__copy">
        <span class="kudo-availability-badge__label">Available on</span>
        <strong>Chrome</strong>
      </span>
    </a>
    <a class="kudo-availability-badge" href="https://addons.mozilla.org/en-US/firefox/addon/kudo-all/">
      <img src="{{ '/assets/icons/firefox.svg' | relative_url }}" alt="" aria-hidden="true" />
      <span class="kudo-availability-badge__copy">
        <span class="kudo-availability-badge__label">Available on</span>
        <strong>Firefox</strong>
      </span>
    </a>
    <a class="kudo-availability-badge" data-kudo-safari-store data-kudo-source="home" href="https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&amp;ct=kudo_safari_home&amp;mt=8">
      <img src="{{ '/assets/icons/safari.svg' | relative_url }}" alt="" aria-hidden="true" />
      <span class="kudo-availability-badge__copy">
        <span class="kudo-availability-badge__label">Available on</span>
        <strong>Safari</strong>
      </span>
    </a>
  </div>
  <p class="kudo-landing-hero__safari-note">
    <a href="{{ '/safari/' | relative_url }}">
      <span class="kudo-l10n--en" lang="en">Safari for Mac: features, one-time purchase and setup →</span>
      <span class="kudo-l10n--de" lang="de">Safari für Mac: Funktionen, Einmalkauf und Einrichtung →</span>
      <span class="kudo-l10n--zh" lang="zh-CN">Mac Safari 版：功能、一次性购买与启用步骤 →</span>
    </a>
  </p>
</section>

<section class="kudo-demo kudo-trilingual" aria-labelledby="kudo-demo-title">
  <div class="kudo-demo__heading">
    <p class="kudo-demo__eyebrow">
      <span class="kudo-l10n--zh" lang="zh-CN">实际操作演示</span>
      <span class="kudo-l10n--en" lang="en">SEE IT IN ACTION</span>
      <span class="kudo-l10n--de" lang="de">SO FUNKTIONIERT'S</span>
    </p>
    <h2 id="kudo-demo-title">
      <span class="kudo-l10n--zh" lang="zh-CN">看看 Kudo All 如何工作</span>
      <span class="kudo-l10n--en" lang="en">See how Kudo All works</span>
      <span class="kudo-l10n--de" lang="de">So funktioniert Kudo All</span>
    </h2>
    <p>
      <span class="kudo-l10n--zh" lang="zh-CN">在 Garmin Connect Web 与 Strava 上，一次点击完成批量点赞。</span>
      <span class="kudo-l10n--en" lang="en">See one-click kudos in action on Garmin Connect Web and Strava.</span>
      <span class="kudo-l10n--de" lang="de">Sieh dir an, wie du auf Garmin Connect Web und Strava mit einem Klick Kudos vergibst.</span>
    </p>
  </div>
  <div class="kudo-demo__video">
    <iframe
      src="https://www.youtube-nocookie.com/embed/edJNdPsyp7I?rel=0"
      title="Garmin Connect Web and Strava Kudo All browser extension demo"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>
</section>

{% include safari-offer.html source="home" %}

<div class="kudo-readme">
{% capture readme_content %}{% include_relative README.md %}{% endcapture %}
{% assign readme_parts = readme_content | split: '<!-- kudo-home-video-preview:start -->' %}
{% assign readme_tail = readme_parts[1] | split: '<!-- kudo-home-video-preview:end -->' %}
{% assign readme_after_video = readme_tail[1] %}
{% assign readme_without_video = readme_parts[0] | append: readme_after_video %}
{% assign more_apps_parts = readme_without_video | split: '<!-- kudo-home-more-apps:start -->' %}
{% assign more_apps_tail = more_apps_parts[1] | split: '<!-- kudo-home-more-apps:end -->' %}
{% assign readme_after_more_apps = more_apps_tail[1] %}
{{ more_apps_parts[0] | markdownify }}
</div>

<section class="kudo-more-apps" aria-labelledby="kudo-more-apps-title">
  <header class="kudo-more-apps__header">
    <h2 class="kudo-more-apps__title" id="kudo-more-apps-title">
      <span class="kudo-l10n--zh" lang="zh-CN">更多扩展与应用</span>
      <span class="kudo-l10n--en" lang="en">More Extensions and Apps</span>
    </h2>
  </header>
  <div class="kudo-more-apps__content">
    {% include product-promo.html context="home" hide_heading=true labelledby="kudo-more-apps-title" %}
  </div>
</section>

<div class="kudo-readme">
{{ readme_after_more_apps | markdownify }}
</div>
