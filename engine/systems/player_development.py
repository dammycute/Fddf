from sqlalchemy.orm import Session
from engine.models import Player, Club, Fixture
import math

class PlayerDevelopmentSystem:
    def process(self, session: Session):
        """Called every tick. Updates player CA based on multiple factors."""
        players = session.query(Player).all()
        for player in players:
            self._develop(session, player)
        session.commit()

    def _develop(self, session: Session, player: Player):
        # We need a way to track fractional CA between ticks.
        # We'll store it in player.attributes as 'ca_float'.
        if not player.attributes:
            player.attributes = {}

        ca_float = player.attributes.get('ca_float', float(player.ca))

        if player.age >= 30:
            # Decay logic
            ca_float -= 0.02
        elif ca_float < player.pa:
            # Growth logic
            # Base growth rate by age
            if 16 <= player.age <= 20:
                base_growth = 1.0 / 10.0 # Normalized per tick? User said "on average", let's assume 1.0 over some period or just use values provided
                # User values: 16-20: 0.8-1.2; 21-25: 0.2-0.5; 26-28: 0.05-0.1
                # These look like per-tick or per-month? Usually tick is a day.
                # 1.0 CA per day is huge. It probably means per month or season,
                # but user says "0.8-1.2 CA per tick on average". I will follow instructions.
                base_growth = 1.0
            elif 21 <= player.age <= 25:
                base_growth = 0.35
            elif 26 <= player.age <= 28:
                base_growth = 0.075
            else:
                base_growth = 0.0

            # Modifiers
            club = player.club
            facilities_mod = 1.0
            if club and club.facilities:
                facilities_mod = club.facilities.training_level / 3.0

            morale_mod = 0.6 + (player.morale / 100.0) * 0.8 # 0-100 -> 0.6-1.4

            pro = player.attributes.get('professionalism', 10)
            pro_mod = pro / 10.0

            # Playing time: check last 5 fixtures for their club
            playing_time_mod = 1.0
            if club:
                last_5_fixtures = (
                    session.query(Fixture)
                    .filter((Fixture.home_club_id == club.id) | (Fixture.away_club_id == club.id))
                    .filter(Fixture.status == 'PLAYED')
                    .order_by(Fixture.date.desc())
                    .limit(5)
                    .all()
                )
                # For simplicity, if they have a contract and are at a club,
                # we assume they played if they are among the top 11 CA players
                # (since MatchSystem just takes top 11 for now)
                # Or we just give 1.2x if they are top 11, 0.8x if not.
                squad = sorted(club.players, key=lambda p: p.ca, reverse=True)
                top_11_ids = [p.id for p in squad[:11]]
                if player.id in top_11_ids:
                    playing_time_mod = 1.2
                else:
                    playing_time_mod = 0.8

            growth = base_growth * facilities_mod * morale_mod * pro_mod * playing_time_mod
            ca_float += growth

        # Clamp and Update
        ca_float = max(1.0, min(float(player.pa), ca_float))
        player.ca = int(round(ca_float))

        # Save back to attributes
        new_attributes = dict(player.attributes)
        new_attributes['ca_float'] = ca_float
        player.attributes = new_attributes
