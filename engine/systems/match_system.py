from sqlalchemy.orm import Session
from engine.models import Fixture, Club, MatchReport, NewsEvent
from engine.match.engine import MatchEngine
import datetime

class MatchSystem:
    def process_pending_matches(self, session: Session, current_date: datetime.date):
        # Convert date to datetime for comparison if necessary, or just compare dates
        # SQLite storage of DateTime can be tricky with date objects.
        # We'll use a broad filter and check in python or use cast.

        all_scheduled = session.query(Fixture).filter(Fixture.status == 'SCHEDULED').all()
        pending = [f for f in all_scheduled if f.date.date() <= current_date]

        for fixture in pending:
            home_club = session.get(Club, fixture.home_club_id)
            away_club = session.get(Club, fixture.away_club_id)

            # Average morale of top 11
            home_players = sorted(home_club.players, key=lambda p: p.ca, reverse=True)[:11]
            away_players = sorted(away_club.players, key=lambda p: p.ca, reverse=True)[:11]

            home_morale = sum(p.morale for p in home_players) / max(1, len(home_players))
            away_morale = sum(p.morale for p in away_players) / max(1, len(away_players))

            home_data = {
                "players": home_players,
                "tactics": home_club.manager.tactical_style if home_club.manager else {},
                "morale": home_morale
            }
            away_data = {
                "players": away_players,
                "tactics": away_club.manager.tactical_style if away_club.manager else {},
                "morale": away_morale
            }

            engine = MatchEngine(home_data, away_data, fixture.id)
            result = engine.simulate()

            fixture.home_goals = result['score']['home']
            fixture.away_goals = result['score']['away']
            fixture.status = 'PLAYED'

            # Save MatchReport
            report = MatchReport(
                fixture_id=fixture.id,
                home_possession=result['player_stats']['home_possession'],
                away_possession=result['player_stats']['away_possession'],
                home_shots=result['player_stats']['home_shots'],
                away_shots=result['player_stats']['away_shots'],
                events=result['events']
            )
            session.add(report)

            # Process news events from match
            for event in result['events']:
                if event['type'] in ['RED_CARD', 'INJURY']:
                    session.add(NewsEvent(
                        title=f"Match Event: {event['type']}",
                        content=f"{event['player_name']} ({event['team']}) involved in {event['type']} at minute {event['minute']}",
                        date=current_date if isinstance(current_date, datetime.datetime) else datetime.datetime.combine(current_date, datetime.time.min),
                        importance=1
                    ))

        session.commit()
