let _intl;

try {
  if (window.chrome !== undefined) {
    _intl = chrome.i18n;
  } else {
    _intl = browser.i18n;
  }
} catch (err) {
  _intl = {
    getMessage: function (messageName, substitutions) {
      if (substitutions) {
        return substitutions;
      }

      return messageName;
    },
  };
}

function getMessage(messageName, substitutions) {
  return _intl.getMessage(messageName, substitutions);
}

const Strava = {
  getContainer: function () {
    const container = document.querySelector('[class="user-nav nav-group"]');

    return container;
  },

  findKudosButtons: function (container) {
    const selector =
      "button[data-testid='kudos_button'] > svg[data-testid='unfilled_kudos']";

    if (!container) {
      return Array.from(document.querySelectorAll(selector));
    }

    return Array.from(container.querySelectorAll(selector));
  },

  createFilter: function (athleteLink) {
    const href = athleteLink.href
      .replace("https://www.strava.com", "")
      .replace("https://strava.com", "");

    return (item) => !item.querySelector(`a[href^="${href}"]`);
  },

  getKudosButtons: function () {
    const athleteLink = document.querySelector(
      "#athlete-profile a[href^='/athletes']"
    );

    if (!athleteLink) {
      return Strava.findKudosButtons();
    }

    let activities = document.querySelectorAll(
      "div[data-testid='web-feed-entry']"
    );

    if (activities.length < 1) {
      return Strava.findKudosButtons();
    }

    activities = Array.from(activities).filter(
      Strava.createFilter(athleteLink)
    );

    if (activities.length < 1) {
      return Strava.findKudosButtons();
    }

    return activities.flatMap(Strava.findKudosButtons).filter((item) => !!item);
  },

  createButton: function () {
    const label = getMessage("kudo_all", "Kudo All");

    const navItemLi = document.createElement("li");
    const navItemA = document.createElement("a");

    navItemLi.className = "nav-item";
    navItemLi.style.marginRight = "10px";

    navItemA.href = "#";
    navItemA.className = "btn btn-default btn-sm empty";

    const navItemIcon = document.createElement("span");
    navItemIcon.className = "app-icon icon-kudo";
    navItemIcon.style.marginRight = "5px";

    const navItemText = document.createElement("span");
    navItemText.className = "ka-progress text-caption1";
    navItemText.textContent = label;

    navItemA.append(navItemIcon);
    navItemA.append(navItemText);
    navItemLi.append(navItemA);

    return navItemLi;
  },

  kudoAllHandler: function (event) {
    event.preventDefault();

    const icons = Strava.getKudosButtons();
    const len = icons.length;

    if (len < 1) {
      return;
    }

    for (let i = 0; i < len; i++) {
      const item = icons[i];

      if (!item) {
        continue;
      }

      const parentItem = item.parentElement;

      if (parentItem) {
        parentItem.click();
      }
    }
  },
  stravaStandBy: function () {
    console.log("Strava Kudo All Starts running....");
    const buttonExisted = document.querySelector(
      'div[class="ka-progress text-caption1"]'
    );
    if (!buttonExisted) {
      console.log("Strava button not exist");

      const container = Strava.getContainer();
      console.log("strava nav container ");
      console.log(container);

      if (container) {
        const button = Strava.createButton();
        container.prepend(button);
        button.addEventListener("click", Strava.kudoAllHandler);
      }
    }
  },
};

const GC = {
  getContainer: function () {
    // at page https://connect.garmin.cn/modern/newsfeed
    const container = document.querySelector('div[class="header-nav"]');

    console.log("container is?");
    console.log(container);
    if (container) {
      const el = document.createElement("div");
      el.classList.add("kudo-all-nav-item");
      el.classList.add("header-nav-item");
      el.style.height = "60px";
      el.style.width = "50px";
      console.log("container.children?");
      console.log(container.children);
      container.prepend(el);
      return document.querySelector("div[class^=kudo-all-nav-item]");
    }
    return null;
  },
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
   * @param {*} container
   * @returns
   */
  findKudosButtons: function (container) {
    const selector =
      'button[class^="CommentLikeSection_socialIconWrapper"] > div[class*="CommentLikeSection_animateBox"] > i[class*=icon-heart-inverted]';

    if (!container) {
      return Array.from(document.querySelectorAll(selector));
    }

    return Array.from(container.querySelectorAll(selector));
  },

  //todo: a link-like button seems to be more native, so any way to beautify the button?
  createButton: function () {
    const label = getMessage("kudo_all", "Kudo All");

    const link = document.createElement("a");
    link.href = "#";
    link.className = "header-nav-link icon-heart-inverted";
    link.setAttribute("aria-label", label);
    link.setAttribute("data-original-title", label);
    link.setAttribute("data-rel", "tooltip");
    return link;
  },

  kudoAllHandler: function (event) {
    event.preventDefault();
    if (window.location.pathname !== "/modern/newsfeed") {
      return;
    }

    const icons = GC.findKudosButtons();
    const len = icons.length;

    if (len < 1) {
      return;
    }

    for (let i = 0; i < len; i++) {
      const item = icons[i];

      if (!item) {
        continue;
      }

      if (item) {
        item.click();
      }
    }
  },

  execute: function () {
    // Check if the current pathname is "/modern/newsfeed"
    //container is to place the button
    const container = GC.getContainer();

    console.log("button container is?");
    console.log(container);
    if (container) {
      const button = GC.createButton();
      container.append(button);

      button.addEventListener("click", GC.kudoAllHandler);
    }
  },
  garminConnectStandBy: function () {
    console.log("GCW Kudo All Starts running....");

    let loaded = false;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        // console.log(mutation);
        if (
          !loaded &&
          mutation.type === "childList" &&
          mutation.target.className &&
          typeof mutation.target.className === "string" &&
          mutation.target.className.startsWith(
            "NewsFeedPageContainer_headerWrapper"
          )
        ) {
          console.log("NewsFeedPageContainer_headerWrapper loaded~");
          loaded = true;
          GC.execute();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
};

const isHostStrava = function () {
  const currentHostname = window.location.hostname;
  const stravaDomainPattern = /^.*\.strava\.com$/;
  return stravaDomainPattern.test(currentHostname);
};

window.onload = function () {
  console.log("Kudo All Starts running....");
  const inStrava = isHostStrava();
  if (inStrava) {
    Strava.stravaStandBy();
  } else {
    GC.garminConnectStandBy();
  }
};
