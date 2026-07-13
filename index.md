---
layout: default
title: GCW & Strava Kudo All
---

<section class="kudo-landing-hero">
  <p class="kudo-landing-hero__badge">ONE CLICK · MORE ENCOURAGEMENT</p>
  <h1>Kudo All</h1>
  <p class="kudo-landing-hero__copy">在 Garmin Connect 与 Strava 上，一次点击为当前动态中的朋友送出鼓励。轻巧、直接，也保留一点点赞的仪式感。</p>
  <div class="kudo-landing-hero__actions">
    <a href="https://chrome.google.com/webstore/detail/gcw-and-strava-kudo-all/folhiecfhnmdniibjjcfogpdoafdamoc">安装 Chrome 扩展</a>
    <a href="https://addons.mozilla.org/en-US/firefox/addon/kudo-all/">Firefox</a>
    <a href="https://apps.apple.com/us/app/kudo-all-in-garmin-connect-web/id6458730808">Safari</a>
  </div>
</section>

{% include product-promo.html context="home" %}

<div class="kudo-readme">
{% capture readme_content %}{% include_relative README.md %}{% endcapture %}
{{ readme_content | markdownify }}
</div>
