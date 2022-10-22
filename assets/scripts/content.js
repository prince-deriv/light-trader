/************* JS COOKIE ************************/
/*! js-cookie v3.0.1 | MIT */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global = global || self),
      (function () {
        var current = global.Cookies;
        var exports = (global.Cookies = factory());
        exports.noConflict = function () {
          global.Cookies = current;
          return exports;
        };
      })());
})(this, function () {
  "use strict";

  /* eslint-disable no-var */
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target;
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      );
    },
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init(converter, defaultAttributes) {
    function set(key, value, attributes) {
      if (typeof document === "undefined") {
        return;
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === "number") {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      key = encodeURIComponent(key)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      var stringifiedAttributes = "";
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }

        stringifiedAttributes += "; " + attributeName;

        if (attributes[attributeName] === true) {
          continue;
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
      }

      return (document.cookie =
        key + "=" + converter.write(value, key) + stringifiedAttributes);
    }

    function get(key) {
      if (typeof document === "undefined" || (arguments.length && !key)) {
        return;
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var value = parts.slice(1).join("=");

        try {
          var foundKey = decodeURIComponent(parts[0]);
          jar[foundKey] = converter.read(value, foundKey);

          if (key === foundKey) {
            break;
          }
        } catch (e) {}
      }

      return key ? jar[key] : jar;
    }

    return Object.create(
      {
        set: set,
        get: get,
        remove: function (key, attributes) {
          set(
            key,
            "",
            assign({}, attributes, {
              expires: -1,
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes));
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes);
        },
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) },
      }
    );
  }

  var api = init(defaultConverter, { path: "/" });
  /* eslint-enable no-var */

  return api;
});
/********************************************** */

const qs = (e) => document.querySelector(e);
const qsAll = (e) => document.querySelectorAll(e);
const gID = (e) => document.getElementById(e);

const THEME_COLOR = "#45A5FF";
const POPUP_ID = "lt-popup-container";
const FRAME_ID = "lt-frame-container";
const TOKEN_KEY = "lt_token";
const FRAME_SRC = "http://localhost:1234/";
const HOST_NAME = "dtrader-air.vercel.app";
const LOGIN_POPUP = "dtrader-air-login";
const BRANDING = "dtrader-air-branding";
const IS_SHOW_POPUP = "is_show_popup";

const host_name = window.location.hostname;
const is_correct_hostname = () => host_name === HOST_NAME;
const is_popup_login = () => LOGIN_POPUP === window.name;

const settings = {
  is_show_popup: localStorage.getItem(IS_SHOW_POPUP) === "true" || false,
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { action } = request;

  switch (action) {
    case "logout":
      Cookies.remove(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      window.location.reload();

      break;
  }
});

const applyCSS = (e, css) => {
  Object.keys(css).forEach((k) => {
    const css_property = k;
    const css_value = css[k];

    e.style[css_property] = css_value;
  });
};

const handlePopup = () => {
  const existing_popup = gID(POPUP_ID);

  const popup = document.createElement("section");
  const iframe = document.createElement("iframe");
  const branding = document.createElement("img");

  if (!existing_popup && !is_popup_login() && !inIframe()) {
    popup.setAttribute("id", POPUP_ID);

    applyCSS(popup, {
      position: "fixed",
      zIndex: "9999999",
      bottom: "10px",
      right: "10px",
      background: THEME_COLOR,
      width: "320px",
      height: "600px",
      borderRadius: "10px",
      boxShadow: "#aaa 0px 0px 10px",
      padding: "10px",
      transition: "all 0.2s ease-in",
    });

    iframe.setAttribute("id", FRAME_ID);
    iframe.setAttribute("src", FRAME_SRC);
    iframe.setAttribute("frameBorder", "none");
    iframe.setAttribute("allowTransparency", true);
    iframe.setAttribute("scrolling", "no");

    applyCSS(iframe, {
      width: "calc(100% - 2px)",
      height: "calc(100% - 2px)",
      borderRadius: "10px",
    });

    branding.setAttribute(
      "src",
      "https://prince-deriv.github.io/light-trader/assets/images/icon.png"
    );
    branding.setAttribute("id", BRANDING);
    branding.addEventListener("click", () => {
      const { is_show_popup } = settings;

      settings.is_show_popup = !is_show_popup;
      localStorage.setItem(IS_SHOW_POPUP, !is_show_popup);

      togglePopup();
    });

    applyCSS(branding, {
      borderRadius: "10px",
      width: "50px",
      height: "50px",
      position: "absolute",
      top: "15px",
      left: "-20px",
      cursor: "pointer",
      boxShadow: "1px 1px 10px #3c90de",
    });

    popup.appendChild(iframe);
    popup.appendChild(branding);

    document.body.appendChild(popup);

    togglePopup();
  }
};

const togglePopup = () => {
  const { is_show_popup } = settings;
  const current_popup = gID(POPUP_ID);
  const current_branding = gID(BRANDING);

  if (is_show_popup) {
    applyCSS(current_popup, {
      width: "320px",
      height: "600px",
    });

    applyCSS(current_branding, {
      top: "15px",
      left: "-20px",
    });
  } else {
    applyCSS(current_popup, {
      width: "0px",
      height: "0px",
    });

    applyCSS(current_branding, {
      top: "-30px",
      left: "-30px",
    });
  }
};

const launchApp = () => {
  handlePopup();

  // chrome.storage.local.get(["dark_mode", "auto_popup"], function (result) {
  //   const { auto_popup } = result;

  //   settings.auto_popup = auto_popup;

  //   if (auto_popup && !is_popup_login() && !inIframe()) {
  //     buildPopUp();
  //   } else {
  //     destroyPopUp();
  //   }
  // });
};

const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Check LOGIN state
const checkLoginState = () => {
  // Use token stored in the chrome.storage

  chrome.storage.local.get([TOKEN_KEY], function (result) {
    const current_token = result[TOKEN_KEY];
    const token = Cookies.get(TOKEN_KEY);
    const local_token = localStorage.getItem(TOKEN_KEY);

    if (inIframe()) {
      // iFrame specific stuff
    }

    if (token !== current_token && is_correct_hostname()) {
      console.log("Storing new token");
      // Store new token
      const data = {
        [TOKEN_KEY]: token,
      };

      chrome.storage.local.set(data, function () {
        // Close login popup
        if (is_popup_login() && is_correct_hostname()) {
          window.close();
        }

        // Handle Popup when cookie is handled
        launchApp();

        return false;
      });
    }

    // Token exist in chrome storage but not in the browser
    if (
      (!token || token === "null" || token === undefined) &&
      !local_token &&
      current_token &&
      !is_correct_hostname()
    ) {
      Cookies.set(TOKEN_KEY, current_token);
      localStorage.setItem(TOKEN_KEY, current_token);

      console.log("Token set by the chrome extension");

      window.location.reload();
    }

    launchApp();
  });
};

setInterval(() => {
  checkLoginState();
}, 1500);
