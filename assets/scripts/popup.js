const qs = (e) => document.querySelector(e);
const qsAll = (e) => document.querySelectorAll(e);
const gID = (e) => document.getElementById(e);
const TOKEN_KEY = "lt_token";
const APP_ID = 33157;
const LOGIN_POPUP = "dtrader-air-login";

window.onload = () => {
  app.init();

  // Logout
  gID("logout-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        action: "logout",
      },
      function () {
        // Empty token
        const data = {
          [TOKEN_KEY]: null,
        };

        chrome.storage.local.set(data, function () {
          console.log(data);
          window.close();
        });
      }
    );
  });

  // login
  gID("login-btn").addEventListener("click", () => {
    popupCenter({
      url: `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=en&brand=light-trader`,
      title: LOGIN_POPUP,
      w: 900,
      h: 500,
    });
  });

  // Auto Popup config
  gID("auto-popup-input").addEventListener("change", () => app.setConfigs());
};

const popupCenter = ({ url, title, w, h }) => {
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    `
    scrollbars=yes,
    width=${w / systemZoom}, 
    height=${h / systemZoom}, 
    top=${top}, 
    left=${left}
    `
  );

  if (window.focus) newWindow.focus();
};

const hideLoading = () => {
  gID("account-loader").style.display = "none";
};

const app = {
  init: () => {
    app.setConfigs();
    app.handleAccount();
  },
  fetchConfigs: () => {
    // const auto_popup = gID("auto-popup-input").checked;
    // const dark_mode = gID("dark-mode-input").checked;

    return {
      auto_popup: false,
      dark_mode: false,
    };
  },
  setConfigs: () => {
    const configs = app.fetchConfigs();

    console.log({ configs });

    chrome.storage.local.set(configs, () => {});
  },
  handleAccount: () => {
    chrome.storage.local.get([TOKEN_KEY], function (result) {
      const current_token = result[TOKEN_KEY];

      if (current_token) {
        ws = new WebSocket(
          `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`
        );

        ws.onopen = function (evt) {
          ws.send(JSON.stringify({ authorize: current_token }));
        };

        ws.onmessage = function (msg) {
          const data = JSON.parse(msg.data);

          const account = data.authorize;

          if (account) {
            const { balance, country, currency, email, fullname, loginid } =
              account;

            hideLoading();
            gID("table-user-account").style.display = "block";
            gID("a-balance").innerHTML = balance;
            gID("a-currency").innerHTML = currency;
            gID("a-residence").innerHTML = country;
            gID("a-email").innerHTML = email;
            gID("a-name").innerHTML = fullname;
            gID("a-login-id").innerHTML = loginid;
          } else {
            hideLoading();
            gID("no-account").style.display = "flex";
          }
        };
      } else {
        hideLoading();
        gID("no-account").style.display = "flex";
      }
    });
  },
};
