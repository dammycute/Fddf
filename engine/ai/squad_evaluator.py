from collections import defaultdict
from engine.models import Player

class SquadEvaluator:
    """Scores a club's squad strength and identifies weaknesses."""

    POSITIONS = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST']
    IDEAL_SQUAD_SIZE = 22
    MIN_PER_POSITION = 1  # absolute minimum
    IDEAL_PER_POSITION = 2

    def evaluate(self, session, club) -> dict:
        """Returns a dict with keys:
            overall_strength: float (average CA of top 11)
            squad_depth: float (average CA of players 12-22)
            weaknesses: list of position strings that need reinforcement
            surplus_positions: list of positions with 3+ players
            avg_age: float
            aging_risk: bool  (True if avg_age of first 11 > 29)
        """
        players = club.players
        if not players:
            return {
                "overall_strength": 0.0,
                "squad_depth": 0.0,
                "weaknesses": list(self.POSITIONS),
                "surplus_positions": [],
                "avg_age": 0.0,
                "aging_risk": False
            }

        # Sort by CA descending
        sorted_players = sorted(players, key=lambda p: p.ca, reverse=True)
        top_11 = sorted_players[:11]
        depth_players = sorted_players[11:22]

        overall_strength = sum(p.ca for p in top_11) / max(1, len(top_11))
        squad_depth = sum(p.ca for p in depth_players) / max(1, len(depth_players))

        avg_age_top_11 = sum(p.age for p in top_11) / max(1, len(top_11))
        avg_age_all = sum(p.age for p in players) / len(players)

        # Position assignment
        pos_counts = defaultdict(int)
        for i, player in enumerate(players):
            pos = player.attributes.get('position') if player.attributes else None
            if not pos:
                # Round-robin fallback
                pos = self.POSITIONS[i % len(self.POSITIONS)]
            pos_counts[pos] += 1

        weaknesses = [pos for pos in self.POSITIONS if pos_counts[pos] < self.IDEAL_PER_POSITION]
        surplus_positions = [pos for pos, count in pos_counts.items() if count >= 3]

        return {
            "overall_strength": float(overall_strength),
            "squad_depth": float(squad_depth),
            "weaknesses": weaknesses,
            "surplus_positions": surplus_positions,
            "avg_age": float(avg_age_all),
            "aging_risk": avg_age_top_11 > 29
        }
