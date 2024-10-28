import { useEffect, useState } from "react";

export default function useLichessAccessToken({ port }) {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    function listener(message) {
      switch (message.action) {
        case "GET_LICHESS_ACCESS_TOKEN":
          if (message.payload) {
            console.log("Found access token");
            setAccessToken(message.payload.value);
          } else {
            console.log("Access token not found");
            setAccessToken(undefined);
          }
          break;
        case "AUTH_LICHESS":
          setAccessToken(message.payload.value);
          break;
      }
    }

    console.log("Adding access token listener to port");
    port.onMessage.addListener(listener);

    console.log("Fetching access token");
    port.postMessage({ action: "GET_LICHESS_ACCESS_TOKEN" });

    return () => {
      console.log("Removing access token listener from port");
      port.onMessage.removeListener(listener);
    };
  }, []);

  return accessToken;
}
