const { handler } = require("./handler")

describe("Handler", () => {
  it("should return a 200 and stats for a given user, perf and colour", async () => {
    const event = {
      queryStringParameters: {
        username: "spaghetti_spoghotti",
        perf: "blitz",
        colour: "white"
      }
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toBeDefined();
  });
});