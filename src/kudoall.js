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
function getContainer() {
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
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 * @param {*} container
 * @returns
 */
function findKudosButtons(container) {
  const selector =
    'button[class^="CommentLikeSection_socialIconWrapper"] > div[class*="CommentLikeSection_animateBox"] > i[class*=icon-heart-inverted]';

  if (!container) {
    return Array.from(document.querySelectorAll(selector));
  }

  return Array.from(container.querySelectorAll(selector));
}

//todo: a link-like button seems to be more native, so any way to beautify the button?
function createButton() {
  const label = getMessage("kudo_all", "Kudo All");

  const link = document.createElement("a");
  link.href = "#";
  link.className = "header-nav-link icon-heart-inverted";
  link.setAttribute("aria-label", label);

  return link;
}

function kudoAllHandler(event) {
  event.preventDefault();
  if (window.location.pathname !== "/modern/newsfeed") {
    return;
  }

  const icons = findKudosButtons();
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
}

function execute() {
  // Check if the current pathname is "/modern/newsfeed"
  //container is to place the button
  const container = getContainer();

  console.log("button container is?");
  console.log(container);
  if (container) {
    const button = createButton();
    container.append(button);

    button.addEventListener("click", kudoAllHandler);
  }
}
let loaded = false;
window.onload = function () {
  console.log("GCW Kudo All Starts running....");

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
        execute();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
