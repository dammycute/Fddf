from sqlalchemy.orm import Session
from engine.models.base import Fixture, Club
from engine.match.engine import MatchEngine
import datetime

class MatchSystem:
    def process_pending_matches(self, session: Session, current_date: datetime.date):
        pending = session.query(Fixture).filter(
            Fixture.status == 'SCHEDULED',
            Fixture.date <= current_date
        ).all()

        for fixture in pending:
            home_club = session.get(Club, fixture.home_club_id)
            away_club = session.get(Club, fixture.away_club_id)

            # Prepare team data for match engine
            # (In reality, we'd fetch the current lineup/tactics)
            home_data = {"players": home_club.players[:11]}
            away_data = {"players": away_club.players[:11]}

            engine = MatchEngine(home_data, away_data)
            result = engine.simulate()

            fixture.home_goals = result['score']['home']
            fixture.away_goals = result['score']['away']
            fixture.status = 'PLAYED'
            # Save events to match_report_id (or a separate table)

        session.commit()
