import { useEffect, useState } from "react";
import { api, OpponentNotes } from "@/shared";

export default function OpponentNotesContainer({ shouldInit, gameInfo, setError, opponentNotes, setOpponentNotes }) {
  const [savingOpponentNotes, setSavingOpponentNotes] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    function fetchOpponentNotes() {
      console.log("Fetching opponent notes");
      api
        .fetchOpponentNotes(gameInfo.user, gameInfo.opponent, abortController.signal)
        .then((responseJson) => {
          console.log("Fetched opponent notes");
          if (responseJson.notes) {
            setOpponentNotes(responseJson.notes);
          } else {
            setOpponentNotes(undefined);
          }
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setError("Failed to fetch opponent notes.");
          }
        });
    }

    if (shouldInit) {
      fetchOpponentNotes();
    }

    return () => {
      console.log("Aborting fetching opponent notes");
      abortController.abort();
    };
  }, [shouldInit, gameInfo]);

  function onSaveOpponentNotes(e) {
    e.preventDefault();
    saveOpponentNotes();
  }

  function saveOpponentNotes() {
    console.log("Saving opponent notes");
    setSavingOpponentNotes(true);
    api
      .saveOpponentNotes(gameInfo.user, gameInfo.opponent, opponentNotes)
      .then(() => console.log("Saved opponent notes"))
      .catch((response) => setError("Failed to save opponent notes."))
      .finally(() => setSavingOpponentNotes(false));
  }

  return (
    <OpponentNotes
      notes={opponentNotes}
      setNotes={setOpponentNotes}
      isLoading={opponentNotes === null}
      onSave={onSaveOpponentNotes}
      isSaving={savingOpponentNotes}
    />
  );
}
