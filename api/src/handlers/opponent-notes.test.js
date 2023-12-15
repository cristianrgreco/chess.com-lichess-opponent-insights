import { createOrUpdateOpponentNotes, getOpponentNotes } from "./opponent-notes.js";

describe("Opponent Notes", () => {
  it("should create opponent notes", async () => {
    const event = {
      body: JSON.stringify({
        username: "username1",
        opponentName: "opponentName",
        notes: "notes",
      }),
    };

    const response = await createOrUpdateOpponentNotes(event);

    expect(response.statusCode).toBe(200);
    expect(await _getOpponentNotes("username", "opponentName")).toBe("notes");
  });

  it("should update opponent notes", async () => {
    const event = {
      body: JSON.stringify({
        username: "username2",
        opponentName: "opponentName",
        notes: "notes",
      }),
    };

    await createOrUpdateOpponentNotes(event);
    const response = await createOrUpdateOpponentNotes({ ...event, notes: "updated notes" });

    expect(response.statusCode).toBe(200);
    expect(await _getOpponentNotes("username", "opponentName")).toBe("updated notes");
  });
});

async function _getOpponentNotes(username, opponentName) {
  const event = { queryStringParameters: { username, opponentName } };
  const response = await getOpponentNotes(event);
  return JSON.parse(response.body).notes;
}
