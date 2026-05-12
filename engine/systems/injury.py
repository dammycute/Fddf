import random
import datetime
from sqlalchemy.orm import Session
from engine.models import Player, Club, NewsEvent, Fixture

class InjurySystem:
    """Rolls for injuries each tick for players who played in recent matches."""

    BASE_INJURY_RATE = 0.002  # 0.2% per tick per player

    def process(self, session: Session, game_date):
        players = session.query(Player).all()
        for player in players:
            self._check_injury(session, player, game_date)
        session.commit()

    def _check_injury(self, session: Session, player: Player, game_date):
        # Recovery: each tick, if player.fitness < 100 and not in a match
        # Check if they had a match today
        has_match_today = session.query(Fixture).filter(
            ((Fixture.home_club_id == player.club_id) | (Fixture.away_club_id == player.club_id)),
            Fixture.date == game_date,
            Fixture.status == 'PLAYED'
        ).first() is not None

        medical_lvl = 1
        if player.club and player.club.facilities:
            medical_lvl = player.club.facilities.medical_level

        if player.fitness < 100:
            if not has_match_today:
                player.fitness = min(100, player.fitness + medical_lvl * 1.5)
            # Skip injury roll if already "injured" (fitness < 20)
            if player.fitness < 20:
                return

        # Roll for injury
        rate = self.BASE_INJURY_RATE

        # medical_level: divide rate by medical_level
        rate /= medical_lvl

        # player age 30+: multiply rate by 1.5
        if player.age >= 30:
            rate *= 1.5

        # stamina: high stamina reduces rate
        stamina = player.attributes.get('stamina', 10) if player.attributes else 10
        rate *= (1.0 - (stamina - 10) * 0.05) # 10 is baseline, 20 is 0.5x, 1 is 1.45x approx

        # fitness < 70: double the rate
        if player.fitness < 70:
            rate *= 2.0

        # injury_proneness: 1-20 -> 0.5x-2x
        proneness = player.attributes.get('injury_proneness', 10) if player.attributes else 10
        rate *= (0.5 + (proneness - 1) * (1.5 / 19.0))

        if random.random() < rate:
            # Injury occurs
            player.fitness = random.randint(0, 19)
            recovery_days = int((100 - player.fitness) / (medical_lvl * 1.5))
            recovery_weeks = max(1, recovery_days // 7)

            news = NewsEvent(
                title="Injury",
                content=f"{player.name} injured, out for estimated {recovery_weeks} weeks",
                date=game_date if isinstance(game_date, datetime.datetime) else datetime.datetime.combine(game_date, datetime.time.min),
                importance=2
            )
            session.add(news)
