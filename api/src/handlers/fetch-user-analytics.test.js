import { fetchUserAnalytics } from "./fetch-user-analytics.js";
import { PAT } from "../test/conf.js";

describe("Fetch user analytics handler", () => {
  it("should return a 200 and analytics for a given platform, user, game type and colour", async () => {
    const event = {
      headers: { Authorization: `Bearer ${PAT}` },
      queryStringParameters: {
        platform: "lichess",
        username: "spaghetti_spoghotti",
        gameType: "blitz",
        colour: "white",
      },
    };

    const response = await fetchUserAnalytics(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toBeDefined();
  });

  it("should return a 401 when Authorization header not provided", async () => {
    const event = {
      queryStringParameters: {
        platform: "lichess",
        username: "freenwil",
        gameType: "blitz",
        colour: "white",
      },
    };

    const response = await fetchUserAnalytics(event);

    expect(response.statusCode).toEqual(401);
  });

  it("should return a 404 when user does not exist", async () => {
    const event = {
      headers: { Authorization: `Bearer ${PAT}` },
      queryStringParameters: {
        platform: "lichess",
        username: "freenwil",
        gameType: "blitz",
        colour: "white",
      },
    };

    const response = await fetchUserAnalytics(event);

    expect(response.statusCode).toEqual(404);
  });
});
