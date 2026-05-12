import datetime
from collections import defaultdict

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from engine.models import Base, Club, Fixture, GameMeta
from engine.utils.generator import seed_world
from engine.systems.fixture_engine import generate_fixtures
from engine.systems.match_system import MatchSystem
from engine.systems.economy import TransferSystem, FinanceSystem
import os


class SimulationEngine:
    def __init__(self, db_path: str):
        self.db_path = db_path
        db_exists = os.path.exists(db_path)

        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

        if not db_exists:
            print("New game detected. Seeding world...")
            session = self.Session()
            seed_world(session)
            # Assuming league ID 1 is the one we created
            generate_fixtures(session, 1)
            session.close()

        # Load persisted game_date or fall back to today
        self.game_date = self._load_game_date() or datetime.date.today()

    def _load_game_date(self):
        """Load game_date from the GameMeta table, if it exists."""
        session = self.Session()
        try:
            meta = session.query(GameMeta).filter_by(key="game_date").first()
            if meta:
                return datetime.date.fromisoformat(meta.value)
            return None
        finally:
            session.close()

    def _save_game_date(self, session):
        """Upsert the game_date key in GameMeta."""
        meta = session.query(GameMeta).filter_by(key="game_date").first()
        if meta:
            meta.value = self.game_date.isoformat()
        else:
            session.add(GameMeta(key="game_date", value=self.game_date.isoformat()))

    def run_tick(self):
        session = self.Session()
        try:
            MatchSystem().process_pending_matches(session, self.game_date)
            FinanceSystem().process_daily_finances(session)

            if self.game_date.weekday() == 0:  # Mondays only
                TransferSystem().process_ai_transfers(session)

            self.game_date += datetime.timedelta(days=1)
            self._save_game_date(session)
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_club_info(self, club_id: int):
        session = self.Session()
        club = session.get(Club, club_id)
        data = {
            "name": club.name,
            "balance": club.balance,
            "reputation": club.reputation,
            "squad_size": len(club.players)
        }
        session.close()
        return data

    def get_fixtures(self, club_id: int):
        """Return a list of fixture dicts where the club is home or away."""
        session = self.Session()
        fixtures = (
            session.query(Fixture)
            .filter(
                (Fixture.home_club_id == club_id) | (Fixture.away_club_id == club_id)
            )
            .order_by(Fixture.date)
            .all()
        )

        results = []
        for f in fixtures:
            home_club = session.get(Club, f.home_club_id)
            away_club = session.get(Club, f.away_club_id)
            results.append({
                "id": f.id,
                "date": f.date.isoformat() if f.date else None,
                "home_name": home_club.name if home_club else None,
                "away_name": away_club.name if away_club else None,
                "home_goals": f.home_goals,
                "away_goals": f.away_goals,
                "status": f.status,
            })

        session.close()
        return results

    def get_league_table(self, league_id: int):
        """Compute the league standings from played fixtures."""
        session = self.Session()
        played = (
            session.query(Fixture)
            .filter(Fixture.league_id == league_id, Fixture.status == "PLAYED")
            .all()
        )

        # Accumulate stats per club_id
        stats = defaultdict(lambda: {
            "played": 0, "won": 0, "drawn": 0, "lost": 0,
            "gf": 0, "ga": 0,
        })

        for f in played:
            hg = f.home_goals or 0
            ag = f.away_goals or 0

            # Home
            h = stats[f.home_club_id]
            h["played"] += 1
            h["gf"] += hg
            h["ga"] += ag
            if hg > ag:
                h["won"] += 1
            elif hg == ag:
                h["drawn"] += 1
            else:
                h["lost"] += 1

            # Away
            a = stats[f.away_club_id]
            a["played"] += 1
            a["gf"] += ag
            a["ga"] += hg
            if ag > hg:
                a["won"] += 1
            elif ag == hg:
                a["drawn"] += 1
            else:
                a["lost"] += 1

        # Build table rows
        table = []
        for club_id, s in stats.items():
            club = session.get(Club, club_id)
            gd = s["gf"] - s["ga"]
            points = s["won"] * 3 + s["drawn"]
            table.append({
                "club_name": club.name if club else f"Club {club_id}",
                "played": s["played"],
                "won": s["won"],
                "drawn": s["drawn"],
                "lost": s["lost"],
                "gf": s["gf"],
                "ga": s["ga"],
                "gd": gd,
                "points": points,
            })

        # Sort by points descending, then goal difference, then goals for
        table.sort(key=lambda r: (-r["points"], -r["gd"], -r["gf"]))

        session.close()
        return table
