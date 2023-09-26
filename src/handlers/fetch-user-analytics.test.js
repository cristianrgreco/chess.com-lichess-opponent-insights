const { handler } = require("./fetch-user-analytics")

describe("Fetch user analytics handler", () => {
  it("should return a 200 and stats for a given platform, user, perf and colour", async () => {
    const event = {
      queryStringParameters: {
        platform: "lichess",
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