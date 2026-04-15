export interface TennisScore {
  points: [number, number]; // raw points in current game (0,1,2,3,...)
  games: [number, number];  // games in current set
  sets: [number[], number[]]; // completed set scores
  isMatchOver: boolean;
  matchWinner: 'player' | 'ai' | null;
}

const POINT_LABELS = ['0', '15', '30', '40'];

export function initialScore(): TennisScore {
  return {
    points: [0, 0],
    games: [0, 0],
    sets: [[], []],
    isMatchOver: false,
    matchWinner: null,
  };
}

export function formatPoints(score: TennisScore): [string, string] {
  const [p, a] = score.points;
  if (p >= 3 && a >= 3) {
    if (p === a) return ['40', '40']; // deuce
    if (p > a) return ['AD', '40'];
    return ['40', 'AD'];
  }
  return [POINT_LABELS[Math.min(p, 3)], POINT_LABELS[Math.min(a, 3)]];
}

export function isDeuce(score: TennisScore): boolean {
  return score.points[0] >= 3 && score.points[1] >= 3 && score.points[0] === score.points[1];
}

export function scorePoint(score: TennisScore, winner: 'player' | 'ai'): { newScore: TennisScore; message: string } {
  const s = JSON.parse(JSON.stringify(score)) as TennisScore;
  const wi = winner === 'player' ? 0 : 1;
  const li = 1 - wi;
  s.points[wi]++;

  // Check if game is won
  if (s.points[wi] >= 4 && s.points[wi] - s.points[li] >= 2) {
    // Game won
    s.games[wi]++;
    s.points = [0, 0];

    // Check if set is won (6 games with 2+ lead, or 7-5, or tiebreak 7-6)
    if (
      (s.games[wi] >= 6 && s.games[wi] - s.games[li] >= 2) ||
      (s.games[wi] === 7)
    ) {
      s.sets[0].push(s.games[0]);
      s.sets[1].push(s.games[1]);
      
      // Count sets won
      const setsWon = [0, 0];
      for (let i = 0; i < s.sets[0].length; i++) {
        if (s.sets[0][i] > s.sets[1][i]) setsWon[0]++;
        else setsWon[1]++;
      }

      // Best of 3 sets
      if (setsWon[wi] >= 2) {
        s.isMatchOver = true;
        s.matchWinner = winner;
        return { newScore: s, message: `${winner === 'player' ? 'You' : 'CPU'} win the match!` };
      }

      s.games = [0, 0];
      return { newScore: s, message: `Set to ${winner === 'player' ? 'You' : 'CPU'}!` };
    }

    return { newScore: s, message: `Game ${winner === 'player' ? 'You' : 'CPU'}!` };
  }

  // Deuce / advantage messages
  if (s.points[0] >= 3 && s.points[1] >= 3) {
    if (s.points[0] === s.points[1]) return { newScore: s, message: 'Deuce!' };
    return { newScore: s, message: `Advantage ${s.points[wi] > s.points[li] ? (winner === 'player' ? 'You' : 'CPU') : (winner === 'player' ? 'CPU' : 'You')}!` };
  }

  return { newScore: s, message: '' };
}
