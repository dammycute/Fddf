import datetime
from collections import defaultdict

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from engine.models import Base, Club, Fixture, GameMeta, MatchReport, Player, TransferOffer, NewsEvent, ClubHistory, Facilities, YouthPlayer
from engine.utils.generator import seed_world
from engine.systems.fixture_engine import generate_fixtures
from engine.systems.match_system import MatchSystem
from engine.systems.economy import TransferSystem, FinanceSystem
from engine.systems.player_development import PlayerDevelopmentSystem
from engine.systems.morale import MoraleSystem
from engine.systems.injury import InjurySystem
from engine.systems.aging import AgingSystem
from engine.ai.manager_ai import ManagerAI
from engine.ai.recruitment import RecruitmentAI
import os


class SimulationEngine:
    def __init__(self, db_path: str):
        self.db_path = db_path
        db_exists = os.path.exists(db_path)

        # Systems and AI
        self.match_system = MatchSystem()
        self.finance_system = FinanceSystem()
        self.transfer_system = TransferSystem()
        self.injury_system = InjurySystem()
        self.morale_system = MoraleSystem()
        self.development_system = PlayerDevelopmentSystem()
        self.aging_system = AgingSystem()
        self.manager_ai = ManagerAI()
        self.recruitment_ai = RecruitmentAI()

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
            # Core gameplay systems
            self.match_system.process_pending_matches(session, self.game_date)
            self.finance_system.process_daily_finances(session)

            if self.game_date.weekday() == 0:  # Mondays only
                self.transfer_system.process_ai_transfers(session)

            # New simulation systems
            try:
                self.injury_system.process(session, self.game_date)
            except Exception as e:
                print(f"InjurySystem failed: {e}")

            try:
                self.morale_system.process(session, self.game_date)
            except Exception as e:
                print(f"MoraleSystem failed: {e}")

            try:
                self.development_system.process(session)
            except Exception as e:
                print(f"PlayerDevelopmentSystem failed: {e}")

            try:
                self.aging_system.process(session, self.game_date)
            except Exception as e:
                print(f"AgingSystem failed: {e}")

            try:
                self.manager_ai.process(session)
            except Exception as e:
                print(f"ManagerAI failed: {e}")

            # Transfer Window every 90 ticks
            meta = session.query(GameMeta).filter_by(key='tick_count').first()
            if meta and int(meta.value) % 90 == 0:
                try:
                    self.run_transfer_window(session)
                except Exception as e:
                    print(f"Transfer Window failed: {e}")

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
            "id": club.id,
            "name": club.name,
            "balance": club.balance,
            "reputation": club.reputation,
            "squad_size": len(club.players),
            "transfer_budget": club.transfer_budget,
            "wage_budget": club.wage_budget
        }
        session.close()
        return data

    def get_squad(self, club_id: int):
        session = self.Session()
        players = session.query(Player).filter_by(club_id=club_id).all()
        results = []
        for p in players:
            contract_data = None
            if p.contract:
                contract_data = {
                    "id": p.contract.id,
                    "wage": p.contract.wage,
                    "end_date": p.contract.end_date.isoformat() if p.contract.end_date else None,
                    "release_clause": p.contract.release_clause,
                    "status": p.contract.status
                }

            results.append({
                "id": p.id,
                "club_id": p.club_id,
                "name": p.name,
                "age": p.age,
                "nationality": p.nationality,
                "attributes": p.attributes,
                "ca": p.ca,
                "pa": p.pa,
                "fitness": p.fitness,
                "stamina": p.stamina,
                "morale": p.morale,
                "contract": contract_data
            })
        session.close()
        return results

    def get_facilities(self, club_id: int):
        session = self.Session()
        fac = session.query(Facilities).filter_by(club_id=club_id).first()
        data = None
        if fac:
            data = {
                "id": fac.id,
                "club_id": fac.club_id,
                "training_level": fac.training_level,
                "medical_level": fac.medical_level,
                "youth_level": fac.youth_level,
                "training_upgrade_cost": fac.training_upgrade_cost,
                "medical_upgrade_cost": fac.medical_upgrade_cost,
                "youth_upgrade_cost": fac.youth_upgrade_cost,
                "upgrade_in_progress": fac.upgrade_in_progress
            }
        session.close()
        return data

    def get_youth_players(self, club_id: int):
        session = self.Session()
        youth = session.query(YouthPlayer).filter_by(club_id=club_id).all()
        results = []
        for y in youth:
            results.append({
                "id": y.id,
                "club_id": y.club_id,
                "name": y.name,
                "age": y.age,
                "nationality": y.nationality,
                "position": y.position,
                "pa": y.pa,
                "personality_id": y.personality_id,
                "intake_season": y.intake_season,
                "promoted": y.promoted
            })
        session.close()
        return results

    def get_news_feed(self, limit: int = 20):
        session = self.Session()
        news = session.query(NewsEvent).order_by(NewsEvent.date.desc()).limit(limit).all()
        results = []
        for n in news:
            results.append({
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "date": n.date.isoformat(),
                "importance": n.importance
            })
        session.close()
        return results

    def get_club_history(self, club_id: int):
        session = self.Session()
        history = session.query(ClubHistory).filter_by(club_id=club_id).order_by(ClubHistory.season.desc()).all()
        results = []
        for h in history:
            results.append({
                "id": h.id,
                "club_id": h.club_id,
                "season": h.season,
                "achievement": h.achievement,
                "data": h.data
            })
        session.close()
        return results

    def get_financials(self, club_id: int):
        from engine.models.finance import FinancialRecord, Sponsorship
        session = self.Session()
        records = (
            session.query(FinancialRecord)
            .filter_by(club_id=club_id)
            .order_by(FinancialRecord.date.desc())
            .limit(50)
            .all()
        )
        sponsorships = session.query(Sponsorship).filter_by(club_id=club_id, status='ACTIVE').all()

        results = {
            "records": [{
                "id": r.id,
                "date": r.date.isoformat(),
                "type": r.record_type,
                "amount": r.amount,
                "description": r.description
            } for r in records],
            "sponsorships": [{
                "id": s.id,
                "sponsor": s.sponsor_name,
                "amount": s.amount_per_season,
                "end_season": s.end_season
            } for s in sponsorships]
        }
        session.close()
        return results

    def upgrade_facility(self, club_id: int, fac_type: str):
        session = self.Session()
        club = session.get(Club, club_id)
        fac = session.query(Facilities).filter_by(club_id=club_id).first()

        if not club or not fac:
            session.close()
            return {"ok": False, "error": "Club or Facilities not found"}

        cost = 0
        if fac_type == 'training': cost = fac.training_upgrade_cost
        elif fac_type == 'medical': cost = fac.medical_upgrade_cost
        elif fac_type == 'youth': cost = fac.youth_upgrade_cost

        if club.balance < cost:
            session.close()
            return {"ok": False, "error": "Insufficient balance"}

        club.balance -= cost
        # Simulate upgrade process (1 month)
        complete_date = self.game_date + datetime.timedelta(days=30)
        fac.upgrade_in_progress = {
            "type": fac_type,
            "complete_date": complete_date.isoformat()
        }

        session.commit()
        session.close()
        return {"ok": True}

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

    def run_transfer_window(self, session):
        self.recruitment_ai.process(session)
        self.recruitment_ai._resolve_offers(session)

    def get_transfer_offers(self, club_id: int):
        """Returns all transfer offers involving this club."""
        session = self.Session()
        offers = (
            session.query(TransferOffer)
            .filter((TransferOffer.from_club_id == club_id) | (TransferOffer.to_club_id == club_id))
            .order_by(TransferOffer.created_date.desc())
            .all()
        )
        results = []
        for o in offers:
            player = session.get(Player, o.player_id)
            from_club = session.get(Club, o.from_club_id) if o.from_club_id else None
            to_club = session.get(Club, o.to_club_id) if o.to_club_id else None
            results.append({
                "id": o.id,
                "player_name": player.name if player else "Unknown",
                "from_club_name": from_club.name if from_club else "AI/Free Agent",
                "to_club_name": to_club.name if to_club else "AI/Listing",
                "fee": o.fee,
                "status": o.status,
                "is_loan": o.is_loan,
                "created_date": o.created_date.isoformat() if o.created_date else None
            })
        session.close()
        return results

    def get_manager_info(self, club_id: int):
        """Returns manager name, morale, demands, contract end date."""
        session = self.Session()
        club = session.get(Club, club_id)
        if not club or not club.manager:
            session.close()
            return None

        manager = club.manager
        data = {
            "name": manager.name,
            "morale": manager.morale,
            "demands": manager.demands,
            "contract_end": manager.contract.end_date.isoformat() if manager.contract else None
        }
        session.close()
        return data

    def get_match_report(self, fixture_id: int):
        """Returns MatchReport data plus fixture details (teams, score, date)."""
        session = self.Session()
        report = session.query(MatchReport).filter_by(fixture_id=fixture_id).first()
        fixture = session.get(Fixture, fixture_id)

        if not fixture:
            session.close()
            return None

        home_club = session.get(Club, fixture.home_club_id)
        away_club = session.get(Club, fixture.away_club_id)

        data = {
            "fixture": {
                "id": fixture.id,
                "date": fixture.date.isoformat() if fixture.date else None,
                "home_name": home_club.name if home_club else "Unknown",
                "away_name": away_club.name if away_club else "Unknown",
                "home_goals": fixture.home_goals,
                "away_goals": fixture.away_goals,
            },
            "report": {
                "home_possession": report.home_possession if report else None,
                "away_possession": report.away_possession if report else None,
                "home_shots": report.home_shots if report else 0,
                "away_shots": report.away_shots if report else 0,
                "events": report.events if report else []
            }
        }
        session.close()
        return data

    def list_player(self, player_id: int, fee: int):
        """Manually list a player for transfer."""
        session = self.Session()
        player = session.get(Player, player_id)
        if not player or not player.club_id:
            session.close()
            return {"ok": False, "error": "Player not found or has no club"}

        # Create listing
        offer = TransferOffer(
            player_id=player.id,
            from_club_id=player.club_id,
            to_club_id=None,
            fee=fee,
            status='LISTED',
            created_date=datetime.datetime.now()
        )
        session.add(offer)
        session.commit()
        session.close()
        return {"ok": True}

    def respond_to_offer(self, offer_id: int, accept: bool):
        """Player-controlled club accepts or rejects a transfer offer."""
        session = self.Session()
        offer = session.get(TransferOffer, offer_id)
        if not offer or offer.status != 'PENDING':
            session.close()
            return {"ok": False, "error": "Offer not found or not pending"}

        if not accept:
            offer.status = 'REJECTED'
            offer.resolved_date = datetime.datetime.now()
        else:
            player = session.get(Player, offer.player_id)
            buyer = session.get(Club, offer.from_club_id)
            seller = session.get(Club, offer.to_club_id) if offer.to_club_id else None

            # Use logic from RecruitmentAI._execute_transfer
            from engine.ai.recruitment import RecruitmentAI
            RecruitmentAI()._execute_transfer(session, offer, player, buyer, seller)

        session.commit()
        session.close()
        return {"ok": True}

    def get_fan_sentiment(self, club_id: int):
        # Placeholder logic for fan sentiment
        return {"club_id": club_id, "rating": 75, "expectation": "Mid-table finish"}

    def get_league_table(self, league_id: int):
        """Compute the league standings from played fixtures."""
        session = self.Session()
        from engine.models import LeagueStanding
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
            standing = session.query(LeagueStanding).filter_by(club_id=club_id).first()
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
                "form": standing.form if standing else []
            })

        # Sort by points descending, then goal difference, then goals for
        table.sort(key=lambda r: (-r["points"], -r["gd"], -r["gf"]))

        session.close()
        return table
