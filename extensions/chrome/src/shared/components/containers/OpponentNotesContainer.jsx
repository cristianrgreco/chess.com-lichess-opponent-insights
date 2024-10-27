import { useEffect, useState } from "react";
import { api, OpponentNotes } from "@/shared";

export default function OpponentNotesContainer({ shouldInit, gameInfo, setError, opponentNotes, setOpponentNotes }) {
  const [savingOpponentNotes, setSavingOpponentNotes] = useState(false);

  useEffect(() => {
    if (shouldInit) {
      fetchOpponentNotes();
    }
  }, [shouldInit, gameInfo]);

  function fetchOpponentNotes() {
    console.log("Fetching opponent notes");
    api
      .fetchOpponentNotes(gameInfo.user, gameInfo.opponent)
      .then((responseJson) => {
        console.log("Fetched opponent notes");
        if (responseJson.notes) {
          setOpponentNotes(responseJson.notes);
        } else {
          setOpponentNotes(undefined);
        }
      })
      .catch(() => setError("Failed to fetch opponent notes."));
  }

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
