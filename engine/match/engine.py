import random
import numpy as np

class MatchEngine:
    def __init__(self, home_team, away_team):
        self.home_team = home_team
        self.away_team = away_team
        self.time = 0
        self.score = {"home": 0, "away": 0}
        self.events = []

        # Grid representation (100x60 units)
        self.ball_pos = np.array([50.0, 30.0])
        self.possession = "home"

        # Simplified player positions for simulation
        self.setup_players()

    def setup_players(self):
        # Assign basic XY to players based on formation
        for side in ["home", "away"]:
            team = self.home_team if side == "home" else self.away_team
            for i, player in enumerate(team['players']):
                # Mock positions
                player.pos = np.array([random.uniform(0, 100), random.uniform(0, 60)])

    def simulate(self):
        # 90 minutes * 6 ticks per minute = 540 ticks
        for tick in range(540):
            self.process_tick(tick)
        return {"score": self.score, "events": self.events}

    def process_tick(self, tick):
        # 1. Decision Logic
        # 2. Movement Logic
        # 3. Action Resolution

        # Simplified: Probability of scoring depends on ball position
        # Moving ball closer to opponent goal increases score chance
        if self.possession == "home":
            self.ball_pos[0] += random.uniform(-1, 3) # Home moves right
        else:
            self.ball_pos[0] -= random.uniform(-1, 3) # Away moves left

        # Bounds check
        self.ball_pos[0] = np.clip(self.ball_pos[0], 0, 100)

        # Scoring
        if self.ball_pos[0] >= 100:
            if random.random() < 0.1:
                self.score["home"] += 1
                self.events.append({"tick": tick, "type": "GOAL", "side": "home"})
            self.ball_pos = np.array([50.0, 30.0]) # Reset
            self.possession = "away"
        elif self.ball_pos[0] <= 0:
            if random.random() < 0.1:
                self.score["away"] += 1
                self.events.append({"tick": tick, "type": "GOAL", "side": "away"})
            self.ball_pos = np.array([50.0, 30.0]) # Reset
            self.possession = "home"
