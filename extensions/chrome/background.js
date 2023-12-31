chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (message.action === "AUTH_LICHESS") {
      handleAuthLichess(port, message);
    }
  });
});

function handleAuthLichess(port, message) {
  loadAccessToken().then((accessTokenFromStorage) => {
    if (accessTokenFromStorage && !shouldRefreshAuthToken(accessTokenFromStorage.expiresAt)) {
      console.log(`Returning Lichess access token from cache: `, accessTokenFromStorage);
      port.postMessage({ action: "AUTH_LICHESS", payload: accessTokenFromStorage });
    } else {
      console.log("Requesting new Lichess access token");
      requestAccessToken(message.payload)
        .then((accessToken) => {
          saveAccessToken(accessToken);
          port.postMessage({ action: "AUTH_LICHESS", payload: accessToken });
        })
        .catch((err) => {
          console.error(`Failed to authorise with Lichess: ${err}`);
          throw err;
        });
    }
  });
}

function shouldRefreshAuthToken(expiresAt) {
  const timeRemainingMins = Math.floor((expiresAt - Date.now()) / 1000 / 60);
  return timeRemainingMins < 60;
}

function saveAccessToken(accessToken) {
  chrome.storage.sync.set({ lichessAccessToken: JSON.stringify(accessToken) });
}

function loadAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("lichessAccessToken", (accessToken) => {
      if (!accessToken.lichessAccessToken) {
        return resolve();
      }
      return resolve(JSON.parse(accessToken.lichessAccessToken));
    });
  });
}

async function requestAccessToken({ user }) {
  const codeVerifier = "baeba1aa6c7fafe635b9fbe66eefddde6e1183a5c02f21c4fc6cb95c";
  const redirectUri = chrome.identity.getRedirectURL();
  const clientId = "chess-analytics.com"; // todo
  const state = Math.random().toString(36).slice(2, 12);
  const oauthRequestParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: await createCodeChallenge(codeVerifier),
    username: user,
    state,
  });
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: `https://lichess.org/oauth?${oauthRequestParams}`, interactive: true },
      (responseUrl) => {
        const responseUrlParams = new URLSearchParams(responseUrl.split("?")[1]);
        if (responseUrlParams.has("error")) {
          const error = responseUrlParams.get("error");
          const errorDescription = responseUrlParams.get("error_description");
          return reject(new Error(`OAuth request auth code response failed with error ${error}: ${errorDescription}`));
        }

        const responseState = responseUrlParams.get("state");
        if (state !== responseState) {
          return reject(new Error("OAuth request auth code response state does not match"));
        }

        const code = responseUrlParams.get("code");
        fetch("https://lichess.org/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code,
            grant_type: "authorization_code",
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
            client_id: clientId,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response
                .json()
                .then((responseJson) => {
                  const error = responseJson["error"];
                  const errorDescription = responseJson["error_description"];
                  return Promise.reject(
                    new Error(`OAuth obtain access token response failed with error ${error}: ${errorDescription}`),
                  );
                })
                .catch(() => {
                  return Promise.reject(
                    new Error(`OAuth obtain access token response failed with status ${response.status}`),
                  );
                });
            }
            return response.json();
          })
          .then((responseJson) => {
            return resolve({
              value: responseJson["access_token"],
              expiresAt: Date.now() + responseJson["expires_in"],
            });
          })
          .catch((err) => {
            return reject(new Error(`Oauth obtain access token failed: ${err}`));
          });
      },
    );
  });
}

async function createCodeChallenge(codeVerifier) {
  return pkceCompatibleBase64UrlEncode(await sha256(codeVerifier));

  function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    return window.crypto.subtle.digest("SHA-256", data);
  }

  function pkceCompatibleBase64UrlEncode(input) {
    let str = "";
    const bytes = new Uint8Array(input);
    for (let i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
}
