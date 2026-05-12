import datetime
from engine.models.base import Fixture, Club, League
from sqlalchemy.orm import Session

def generate_fixtures(session: Session, league_id: int):
    clubs = session.query(Club).all() # Simplification: all clubs in one league
    if len(clubs) < 2:
        return

    # Simple Round Robin
    fixtures = []
    start_date = datetime.datetime.now()

    # Very basic fixture generator
    for i, home in enumerate(clubs):
        for j, away in enumerate(clubs):
            if i != j:
                fixture = Fixture(
                    league_id=league_id,
                    home_club_id=home.id,
                    away_club_id=away.id,
                    date=start_date + datetime.timedelta(days=(i+j)*3),
                    status='SCHEDULED'
                )
                session.add(fixture)

    session.commit()
