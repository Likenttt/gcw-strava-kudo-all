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
  // about selector https://stackoverflow.com/questions/66818352/getting-element-with-queryselectorall-that-starts-with-a-certain-string-but-do
  const container = document.querySelector(
    'div[class*="NewsFeedPageContainer_headerWrapper"]'
  );
  console.log("container is?");
  console.log(container);
  if (container) {
    const el = document.createElement("div");
    el.classList.add("feed-header");
    el.style.height = "40px";
    el.style.width = "100px";
    console.log("container.children?");
    console.log(container.children);

    if (container.children.length == 2) {
      const middleElement = container.children[1];
      container.insertBefore(el, middleElement);
    } else {
      container.prepend(el);
    }
    el.style.display = "flex";
    el.style.justifyContent = "center";
    el.style.alignItems = "center";
    return document.querySelector(".feed-header");
  }
  return null;
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 * @param {*} container
 * @returns
 */
function findKudosButtons(container) {
  // <div class="CommentLikeSection_socialButtonWrapper__qHhrA">
  //   <button class="CommentLikeSection_socialIconWrapper__3wFj3" aria-label="赞">
  //     <div class="animated fadeIn CommentLikeSection_animateBox__1_tEp">
  //       <i class="CommentLikeSection_iconBlue__2t0lF icon-heart-inverted"></i>
  //     </div>
  //   </button>
  // </div>;
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

  const navItem = document.createElement("div");
  navItem.innerHTML = `
  <button class="colored">
    <span>${label}</span>
  </button>
    `;
  return navItem;
}

function kudoAllHandler(event) {
  event.preventDefault();

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

  if (window.location.pathname !== "/modern/newsfeed") {
    return;
  }
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
