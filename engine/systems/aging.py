import random
from sqlalchemy.orm import Session
from engine.models import Player, Club, GameMeta, ClubHistory, NewsEvent, PlayerContract, YouthPlayer
import datetime

class AgingSystem:
    def process(self, session: Session, game_date):
        """Ages players by 1 year on their birthday. Handles retirements."""
        # Get or create tick_count
        meta = session.query(GameMeta).filter_by(key='tick_count').first()
        if not meta:
            meta = GameMeta(key='tick_count', value='0')
            session.add(meta)
            session.flush()

        tick_count = int(meta.value)

        # Birthday logic
        players = session.query(Player).all()
        for player in players:
            # Staggered birthday: (tick_count + player.id) % 365 == 0
            if (tick_count + player.id) % 365 == 0:
                player.age += 1
                self._check_retirement(session, player, game_date)

        # Youth intake: once every 365 ticks
        if tick_count > 0 and tick_count % 365 == 0:
            self._handle_youth_intake(session, game_date)

        # Increment tick count
        meta.value = str(tick_count + 1)
        session.commit()

    def _check_retirement(self, session: Session, player: Player, game_date):
        retire_chance = 0
        if player.age in [35, 36]:
            retire_chance = 0.10
        elif player.age in [37, 38]:
            retire_chance = 0.30
        elif player.age >= 39:
            retire_chance = 0.70

        if random.random() < retire_chance:
            last_club_id = player.club_id
            if last_club_id:
                history = ClubHistory(
                    club_id=last_club_id,
                    season=0, # Should ideally get current season number
                    achievement="Player Retirement",
                    data={"player_name": player.name, "age": player.age}
                )
                session.add(history)

                # Expire contract
                if player.contract:
                    player.contract.status = 'EXPIRED'

            player.club_id = None

            news = NewsEvent(
                title="Retirement",
                content=f"{player.name} retires from professional football at age {player.age}",
                date=game_date if isinstance(game_date, datetime.datetime) else datetime.datetime.combine(game_date, datetime.time.min),
                importance=1
            )
            session.add(news)

    def _handle_youth_intake(self, session: Session, game_date):
        clubs = session.query(Club).all()
        for club in clubs:
            youth_lvl = 1
            if club.facilities:
                youth_lvl = club.facilities.youth_level

            num_intake = random.randint(3, 8)
            # Higher youth level might mean better players, but user just said 3-8 based on youth_level?
            # Usually it means the *quality* is based on youth_level, but the count is 3-8.
            # I'll stick to 3-8 per club.

            for _ in range(num_intake):
                youth = YouthPlayer(
                    club_id=club.id,
                    name=f"New Youth {random.randint(100, 999)}",
                    age=15,
                    nationality="English",
                    position=random.choice(["GK", "DEF", "MID", "FWD"]),
                    pa=random.randint(80, 100) + (youth_lvl * 15),
                    intake_season=0 # Should get current season
                )
                session.add(youth)
