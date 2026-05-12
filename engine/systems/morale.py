from sqlalchemy.orm import Session
from engine.models import Player, Manager, Club, Fixture, LeagueStanding, Season
from sqlalchemy import desc

class MoraleSystem:
    def process(self, session: Session, game_date):
        """Updates player and manager morale each tick."""
        self._update_player_morale(session, game_date)
        self._update_manager_morale(session, game_date)
        session.commit()

    def _update_player_morale(self, session: Session, game_date):
        players = session.query(Player).all()
        for player in players:
            # Drift toward 50 by 0.5 per day
            current_morale = float(player.morale)
            if current_morale > 50:
                current_morale = max(50.0, current_morale - 0.5)
            elif current_morale < 50:
                current_morale = min(50.0, current_morale + 0.5)

            if player.club_id:
                club = player.club
                # Match impact (only if match was today)
                last_match = (
                    session.query(Fixture)
                    .filter((Fixture.home_club_id == club.id) | (Fixture.away_club_id == club.id))
                    .filter(Fixture.status == 'PLAYED')
                    .filter(Fixture.date == game_date)
                    .first()
                )

                if last_match:
                    is_home = last_match.home_club_id == club.id
                    hg = last_match.home_goals or 0
                    ag = last_match.away_goals or 0
                    if (is_home and hg > ag) or (not is_home and ag > hg):
                        current_morale += 3
                    elif (is_home and hg < ag) or (not is_home and ag < hg):
                        current_morale -= 4

                # Loss streak
                standing = session.query(LeagueStanding).filter_by(club_id=club.id).first()
                if standing and standing.form:
                    if len(standing.form) >= 3 and all(r == 'L' for r in standing.form[-3:]):
                        current_morale -= 8

                # Manager influence
                if club.manager and club.manager.morale < 30:
                    current_morale -= 2

            if player.ca > 130:
                current_morale += 1

            player.morale = max(0, min(100, int(round(current_morale))))

    def _update_manager_morale(self, session: Session, game_date):
        managers = session.query(Manager).all()
        for manager in managers:
            # Drift toward 60 by 0.3 per day
            current_morale = float(manager.morale)
            if current_morale > 60:
                current_morale = max(60.0, current_morale - 0.3)
            elif current_morale < 60:
                current_morale = min(60.0, current_morale + 0.3)

            if manager.club_id:
                club = manager.club
                # Match impact
                last_match = (
                    session.query(Fixture)
                    .filter((Fixture.home_club_id == club.id) | (Fixture.away_club_id == club.id))
                    .filter(Fixture.status == 'PLAYED')
                    .filter(Fixture.date == game_date)
                    .first()
                )
                if last_match:
                    is_home = last_match.home_club_id == club.id
                    hg = last_match.home_goals or 0
                    ag = last_match.away_goals or 0
                    if (is_home and hg > ag) or (not is_home and ag > hg):
                        current_morale += 8
                    elif (is_home and hg < ag) or (not is_home and ag < hg):
                        current_morale -= 5

                # Bottom 3 check
                standing = session.query(LeagueStanding).filter_by(club_id=club.id).first()
                if standing:
                    all_standings = (
                        session.query(LeagueStanding)
                        .filter_by(season_id=standing.season_id)
                        .order_by(desc(LeagueStanding.points), desc(LeagueStanding.gd), desc(LeagueStanding.gf))
                        .all()
                    )
                    ids = [s.club_id for s in all_standings]
                    try:
                        pos = ids.index(club.id) + 1
                        if len(ids) >= 3 and pos > len(ids) - 3:
                            current_morale -= 15
                    except ValueError:
                        pass

            manager.morale = max(0, min(100, int(round(current_morale))))
