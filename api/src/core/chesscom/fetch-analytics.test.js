import { fetchAnalytics } from "./fetch-analytics.js";

let machineAnalytics;

beforeAll(async () => {
  machineAnalytics = await fetchAnalytics("leanbeansteenmachine", "blitz", "white");
});

test("should return performance rating history", async () => {
  expect(machineAnalytics.performance).toEqual({
    lowestRating: 1186,
    lowestRatingDateTime: null,
    highestRating: 1346,
    highestRatingDateTime: "2024-09-12T20:06:53.000Z",
    currentRating: 1284,
    totalNumberOfGames: 146,
  });
});

test("should return latest puzzle rating", async () => {
  expect(machineAnalytics.latestPuzzleRating).toEqual({
    date: "2022-06-26T09:32:10.000Z",
    value: 570,
  });
});

/*
{
    "performance": {
        "totalNumberOfDisconnects": 466,
        "currentLosingStreak": 4,
        "currentWinningStreak": 0,
        "tilt": true
    },
    "games": {
        "stats": {
            "numberOfGames": 60,
            "win": {
                "mateRate": 0.1,
                "resignRate": 0.6666666666666666,
                "outOfTimeRate": 0.16666666666666666
            },
            "lose": {
                "mateRate": 0.27586206896551724,
                "resignRate": 0.7241379310344828,
                "outOfTimeRate": 0
            }
        },
        "openings": [
            {
                "name": "Queen's Gambit Accepted",
                "insights": {
                    "numberOfGames": 12,
                    "results": {
                        "win": {
                            "outoftime": 1,
                            "mate": 2,
                            "timeout": 2,
                            "resign": 3
                        },
                        "lose": {
                            "resign": 3
                        },
                        "draw": {
                            "stalemate": 1
                        }
                    },
                    "totals": {
                        "win": 8,
                        "lose": 3,
                        "draw": 1
                    }
                },
                "variations": []
            },
            {
                "name": "Slav Defense",
                "insights": {
                    "numberOfGames": 7,
                    "results": {
                        "win": {
                            "resign": 3
                        },
                        "lose": {
                            "mate": 2,
                            "resign": 2
                        },
                        "draw": {}
                    },
                    "totals": {
                        "win": 3,
                        "lose": 4,
                        "draw": 0
                    }
                },
                "variations": [
                    {
                        "name": "Old Variation",
                        "insights": {
                            "numberOfGames": 11,
                            "results": {
                                "win": {
                                    "outoftime": 1,
                                    "mate": 2,
                                    "timeout": 2,
                                    "resign": 2
                                },
                                "lose": {
                                    "resign": 3
                                },
                                "draw": {
                                    "stalemate": 1
                                }
                            },
                            "totals": {
                                "win": 7,
                                "lose": 3,
                                "draw": 1
                            }
                        }
                    }
                ]
            }
        ],
        "moveTimes": [
            [
                302.35,
                0.7200000000000273
            ]
        ]
    },
    "latestPuzzleRating": {
        "date": "2024-09-10T00:00:00.000Z",
        "value": 2052
    }
}
 */
