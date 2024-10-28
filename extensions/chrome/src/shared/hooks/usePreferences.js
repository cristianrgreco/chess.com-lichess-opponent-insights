import { useEffect, useState } from "react";

export default function usePreferences({ port }) {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    function listener(message) {
      switch (message.action) {
        case "GET_PREFERENCES":
          setPreferences(message.payload);
          break;
      }
    }

    console.log("Adding preferences listener to port");
    port.onMessage.addListener(listener);

    console.log("Fetching preferences");
    port.postMessage({ action: "GET_PREFERENCES" });

    return () => {
      console.log("Removing preferences listener from port");
      port.onMessage.removeListener(listener);
    };
  }, []);

  function savePreferences(preferences) {
    port.postMessage({ action: "SAVE_PREFERENCES", payload: preferences });
  }

  return { preferences, savePreferences };
}
