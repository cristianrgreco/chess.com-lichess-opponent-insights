export default function OpponentNotes({ isLoading, notes, setNotes, onSave, isSaving }) {
  const placeholderClass = isLoading ? "ca_placeholder_enabled" : "";

  return (
    <form action="" id="ca_save_opponent_notes_form" onSubmit={onSave}>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          id="ca_opponent_notes"
          className={`ca_textarea ca_placeholder ${placeholderClass}`}
          value={notes ? notes : ""}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
      <div>
        <button type="submit" disabled={isSaving} className={`ca_button ca_btn-win ca_placeholder ${placeholderClass}`}>
          Save
        </button>
      </div>
    </form>
  );
}
