import { useEffect, useState } from "react";
import * as api from "@/shared/api.js";
import OpponentNotes from "@/shared/components/OpponentNotes.jsx";

export default function OpponentNotesComponent({
  shouldInit,
  user,
  opponent,
  setError,
  opponentNotes,
  setOpponentNotes,
}) {
  const [savingOpponentNotes, setSavingOpponentNotes] = useState(false);

  useEffect(() => {
    if (shouldInit) {
      fetchOpponentNotes();
    }
  }, [shouldInit]);

  function fetchOpponentNotes() {
    console.log("Fetching opponent notes");
    api
      .fetchOpponentNotes(user, opponent)
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
      .saveOpponentNotes(user, opponent, opponentNotes)
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
