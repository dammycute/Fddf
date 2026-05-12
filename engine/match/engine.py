import random

class MatchEngine:
    def __init__(self, home_team: dict, away_team: dict, fixture_id: int):
        self.rng = random.Random(fixture_id)
        self.home = home_team   # { players: [Player], tactics: dict, morale: float }
        self.away = away_team
        self.score = {"home": 0, "away": 0}
        self.events = []        # list of MatchEvent dicts
        self.minute = 0
        self.possession_stats = {"home": 0, "away": 0}
        self.shots = {"home": 0, "away": 0}

    def simulate(self) -> dict:
        """Simulate 90 minutes. Return score, events, player_stats."""

        # Pre-match: calculate team ratings
        ha, hm, hd = self._team_ratings(self.home)
        aa, am, ad = self._team_ratings(self.away)

        # Simulate in 5-minute blocks (18 blocks = 90 min)
        for block in range(18):
            self.minute = block * 5
            self._simulate_block(ha, hm, hd, aa, am, ad)
            # Stamina decay: reduce all players' fitness by 1.5 per block
            self._decay_stamina()

        # Post-match: apply morale changes based on result
        self._apply_post_match_morale()
        return {
            "score": self.score,
            "events": self.events,
            "player_stats": self._compile_stats()
        }

    def _team_ratings(self, team: dict) -> tuple:
        """Return (attack, midfield, defense) ratings 0-100."""
        players = team['players']
        # Use top 11 players by CA
        players = sorted(players, key=lambda p: p.ca, reverse=True)[:11]

        def avg_ca(plist):
            if not plist: return 0
            return sum(p.ca for p in plist) / len(plist)

        # defense = avg CA of defenders (first 4)
        defense_ca = avg_ca(players[:4])
        # midfield = avg CA of midfielders (middle 5)
        midfield_ca = avg_ca(players[4:9])
        # attack = avg CA of forwards (last 2? User said last 3, but 4+5+3=12. Top 11: 4+5+2)
        # Let's use 4 defenders, 5 midfielders, 2 forwards for 11 players.
        attack_ca = avg_ca(players[9:11])

        morale_modifier = max(0.6, min(1.4, team['morale'] / 50.0))
        chemistry_modifier = 1.0
        avg_fitness = sum(p.fitness for p in players) / len(players)
        fatigue_modifier = max(0.5, avg_fitness / 100.0)

        return (
            attack_ca * morale_modifier,
            midfield_ca * chemistry_modifier,
            defense_ca * fatigue_modifier
        )

    def _simulate_block(self, ha, hm, hd, aa, am, ad):
        """Simulate one 5-minute block."""
        possession_prob = hm / max(1.0, (hm + am))

        for m in range(5):
            current_min = self.minute + m
            # Possession
            home_pos = self.rng.random() < possession_prob
            if home_pos:
                self.possession_stats["home"] += 1
                # Shot chance
                shot_chance = (ha / max(1.0, (ad + 1))) * 0.04
                if hm > am:
                    shot_chance += 0.01

                if self.rng.random() < shot_chance:
                    self.shots["home"] += 1
                    # Goal prob
                    # User: (attacking_ca / (defending_ca + goalkeeper_ca)) * 0.35
                    # Since we only have ha and ad, we'll use them.
                    goal_prob = (ha / max(1.0, (ad + 1))) * 0.35
                    if self.rng.random() < goal_prob:
                        self.score["home"] += 1
                        player = self.rng.choice(self.home['players'][9:11] if len(self.home['players']) >= 11 else self.home['players'])
                        self.events.append({"minute": current_min, "type": "GOAL", "team": "home", "player_name": player.name})
            else:
                self.possession_stats["away"] += 1
                shot_chance = (aa / max(1.0, (hd + 1))) * 0.04
                if am > hm:
                    shot_chance += 0.01

                if self.rng.random() < shot_chance:
                    self.shots["away"] += 1
                    goal_prob = (aa / max(1.0, (hd + 1))) * 0.35
                    if self.rng.random() < goal_prob:
                        self.score["away"] += 1
                        player = self.rng.choice(self.away['players'][9:11] if len(self.away['players']) >= 11 else self.away['players'])
                        self.events.append({"minute": current_min, "type": "GOAL", "team": "away", "player_name": player.name})

        # Cards and Injuries (once per block for simplicity, or we could loop)
        for team_name, team_data, opp_team_data in [("home", self.home, self.away), ("away", self.away, self.home)]:
            # Yellow: 2%
            if self.rng.random() < 0.02:
                player = self.rng.choice(team_data['players'][:11])
                # Check if already has yellow (for red card logic)
                # For now we'll just add the event
                self.events.append({"minute": self.minute + 2, "type": "YELLOW_CARD", "team": team_name, "player_name": player.name})

            # Red: 0.2%
            if self.rng.random() < 0.002:
                player = self.rng.choice(team_data['players'][:11])
                self.events.append({"minute": self.minute + 3, "type": "RED_CARD", "team": team_name, "player_name": player.name})

            # Injury: BASE_INJURY_RATE = 0.002
            if self.rng.random() < 0.002:
                player = self.rng.choice(team_data['players'][:11])
                self.events.append({"minute": self.minute + 4, "type": "INJURY", "team": team_name, "player_name": player.name})

    def _decay_stamina(self):
        for player in self.home['players'] + self.away['players']:
            player.fitness = max(0.0, (float(player.fitness) if player.fitness is not None else 100.0) - 1.5)

    def _apply_post_match_morale(self):
        h_score = self.score["home"]
        a_score = self.score["away"]

        for player in self.home['players']:
            if h_score > a_score: player.morale = min(100, player.morale + 10)
            elif h_score == a_score: player.morale = min(100, player.morale + 2)
            else: player.morale = max(0, player.morale - 8)

        for player in self.away['players']:
            if a_score > h_score: player.morale = min(100, player.morale + 10)
            elif a_score == h_score: player.morale = min(100, player.morale + 2)
            else: player.morale = max(0, player.morale - 8)

    def _compile_stats(self) -> dict:
        total = max(1, self.possession_stats["home"] + self.possession_stats["away"])
        return {
            'home_possession': (self.possession_stats["home"] / total) * 100,
            'away_possession': (self.possession_stats["away"] / total) * 100,
            'home_shots': self.shots["home"],
            'away_shots': self.shots["away"]
        }
