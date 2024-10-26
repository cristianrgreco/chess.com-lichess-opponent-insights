import { flipColour } from "@/core/chesscom/utils.js";

export const TEST_TIMESTAMP = 1704067200;
export const TEST_OPENING = "Queens-Pawn-Opening-Mikenas-Defense-2.d5-Ne5";

export function createGame(
  gameResult,
  gameType,
  opponentColour,
  endTime = TEST_TIMESTAMP,
  opening = TEST_OPENING,
  opponentRivalGameResult = "abandoned",
) {
  return {
    time_class: gameType,
    [flipColour(opponentColour)]: {
      rating: 1240,
      result: opponentRivalGameResult,
      username: "myself",
    },
    [opponentColour]: {
      rating: 1250,
      result: gameResult,
      username: "opponent",
    },
    end_time: endTime,
    eco: `https://www.chess.com/openings/${opening}`,
    pgn: `[Event \"Live Chess\"]\n[Site \"Chess.com\"]\n[Date \"2024.09.12\"]\n[Round \"-\"]\n[White \"megusta2x\"]\n[Black \"leanbeansteenmachine\"]\n[Result \"0-1\"]\n[CurrentPosition \"2r3k1/4pp1p/p1Bp2p1/3P4/1p1Q4/1P5P/P1q1nPP1/5RK1 w - -\"]\n[Timezone \"UTC\"]\n[ECO \"B22\"]\n[ECOUrl \"https://www.chess.com/openings/Alapin-Sicilian-Defense-2...d6-3.d4-cxd4-4.cxd4\"]\n[UTCDate \"2024.09.12\"]\n[UTCTime \"19:48:26\"]\n[WhiteElo \"1232\"]\n[BlackElo \"1279\"]\n[TimeControl \"300\"]\n[Termination \"leanbeansteenmachine won by resignation\"]\n[StartTime \"19:48:26\"]\n[EndDate \"2024.09.12\"]\n[EndTime \"19:54:10\"]\n[Link \"https://www.chess.com/game/live/119909439403\"]\n\n1. e4 {[%clk 0:05:00]} 1... c5 {[%clk 0:04:56.4]} 2. c3 {[%clk 0:04:59]} 2... d6 {[%clk 0:04:54.3]} 3. d4 {[%clk 0:04:58.4]} 3... cxd4 {[%clk 0:04:52.7]} 4. cxd4 {[%clk 0:04:58.3]} 4... Nc6 {[%clk 0:04:52.4]} 5. Nf3 {[%clk 0:04:57.3]} 5... Nf6 {[%clk 0:04:49.8]} 6. Nc3 {[%clk 0:04:55]} 6... g6 {[%clk 0:04:48.3]} 7. Bb5 {[%clk 0:04:52.9]} 7... Bd7 {[%clk 0:04:46.6]} 8. O-O {[%clk 0:04:49.7]} 8... Bg7 {[%clk 0:04:45.2]} 9. Be3 {[%clk 0:04:46.9]} 9... O-O {[%clk 0:04:40.2]} 10. h3 {[%clk 0:04:45.8]} 10... a6 {[%clk 0:04:38.2]} 11. Ba4 {[%clk 0:04:44.6]} 11... b5 {[%clk 0:04:36.6]} 12. Bb3 {[%clk 0:04:43.5]} 12... b4 {[%clk 0:04:24.3]} 13. Nd5 {[%clk 0:04:42]} 13... Nxe4 {[%clk 0:04:17.7]} 14. Nb6 {[%clk 0:04:33.8]} 14... Qxb6 {[%clk 0:04:01.9]} 15. d5 {[%clk 0:04:31.4]} 15... Nd4 {[%clk 0:03:47.5]} 16. Bxd4 {[%clk 0:04:23.9]} 16... Bxd4 {[%clk 0:03:45]} 17. Nxd4 {[%clk 0:04:16]} 17... Bb5 {[%clk 0:03:03.9]} 18. Nxb5 {[%clk 0:04:08.3]} 18... Qxb5 {[%clk 0:02:58.9]} 19. Rc1 {[%clk 0:03:46]} 19... Rac8 {[%clk 0:02:56.3]} 20. Rxc8 {[%clk 0:03:33]} 20... Rxc8 {[%clk 0:02:47.1]} 21. Ba4 {[%clk 0:03:31.1]} 21... Qc4 {[%clk 0:02:32.5]} 22. b3 {[%clk 0:03:29.2]} 22... Qc2 {[%clk 0:02:23]} 23. Qd4 {[%clk 0:03:16.5]} 23... Nc3 {[%clk 0:01:48.5]} 24. Bc6 {[%clk 0:02:55]} 24... Ne2+ {[%clk 0:01:45.8]} 0-1\n`,
  };
}
