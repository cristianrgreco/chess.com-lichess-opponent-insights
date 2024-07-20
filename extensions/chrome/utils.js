function _waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function _initTabs(selectors) {
  const hideTab = (selector) => {
    selector.trigger.classList.remove("ca_active");
    selector.el.classList.add("ca_hidden");
  };

  const showTab = (selector) => {
    selector.trigger.classList.add("ca_active");
    selector.el.classList.remove("ca_hidden");
  };

  const initTabEvents = (selectorKey) => {
    selectors[selectorKey].trigger.addEventListener("click", (e) => {
      Object.keys(selectors).forEach((key) => {
        if (key === selectorKey) showTab(selectors[key]);
        else hideTab(selectors[key]);
      });
      selectors[selectorKey].callback();
    });
  };

  Object.keys(selectors).forEach(initTabEvents);
}
