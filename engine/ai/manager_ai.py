import random
import datetime
from sqlalchemy.orm import Session
from engine.models import Manager, Club, GameMeta, NewsEvent, ClubHistory, ManagerContract
from engine.ai.squad_evaluator import SquadEvaluator

class ManagerAI:
    """Simulates manager personality and decisions."""

    def process(self, session: Session):
        managers = session.query(Manager).filter(Manager.club_id.isnot(None)).all()
        for manager in managers:
            self._tick_manager(session, manager)
        session.commit()

    def _tick_manager(self, session: Session, manager: Manager):
        club = session.get(Club, manager.club_id)
        if not club:
            return

        # Get current tick
        meta = session.query(GameMeta).filter_by(key='tick_count').first()
        current_tick = int(meta.value) if meta else 0

        # 1. DEMAND LOGIC
        demands = dict(manager.demands) if manager.demands else {}
        evaluator = SquadEvaluator()
        report = evaluator.evaluate(session, club)

        if club.facilities and club.facilities.training_level < 3 and (manager.tactical_knowledge or 0) > 14:
            demands["upgrade_training"] = True

        if report['weaknesses'] and (manager.man_management or 0) > 12:
            for pos in report['weaknesses']:
                demands[f"sign_{pos}"] = True

        manager.demands = demands

        # 2. RESIGNATION LOGIC
        # Use GameMeta to track low morale ticks: manager_low_morale_<id>
        morale_key = f"manager_low_morale_{manager.id}"
        morale_meta = session.query(GameMeta).filter_by(key=morale_key).first()

        if manager.morale < 20:
            if not morale_meta:
                morale_meta = GameMeta(key=morale_key, value="1")
                session.add(morale_meta)
            else:
                count = int(morale_meta.value) + 1
                morale_meta.value = str(count)
                if count >= 30:
                    self._handle_departure(session, manager, club, "resigns", current_tick)
                    return
        else:
            if morale_meta:
                session.delete(morale_meta)

        # 3. SACKING LOGIC
        # Bottom 3 check (we need league standings)
        # For simplicity, we'll use a similar GameMeta check for the club: club_bottom_3_<id>
        from engine.models import LeagueStanding
        from sqlalchemy import desc

        standing = session.query(LeagueStanding).filter_by(club_id=club.id).first()
        is_bottom_3 = False
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
                    is_bottom_3 = True
            except ValueError:
                pass

        bottom_key = f"club_bottom_3_{club.id}"
        bottom_meta = session.query(GameMeta).filter_by(key=bottom_key).first()

        if is_bottom_3:
            if not bottom_meta:
                bottom_meta = GameMeta(key=bottom_key, value="1")
                session.add(bottom_meta)
            else:
                count = int(bottom_meta.value) + 1
                bottom_meta.value = str(count)
                if count >= 60:
                    self._handle_departure(session, manager, club, "sacked", current_tick)
                    self._hire_new_manager(session, club)
                    return
        else:
            if bottom_meta:
                session.delete(bottom_meta)

    def _handle_departure(self, session, manager, club, reason, tick):
        text = f"{manager.name} {reason} from {club.name}"
        if reason == "sacked":
            text = f"{manager.name} has been sacked by {club.name} due to poor results"

        session.add(NewsEvent(
            title="Managerial Change",
            content=text,
            date=datetime.datetime.now(),
            importance=2
        ))

        session.add(ClubHistory(
            club_id=club.id,
            season=0,
            achievement=f"Manager {reason.capitalize()}",
            data={"manager_name": manager.name}
        ))

        manager.club_id = None
        if manager.contract:
            manager.contract.status = 'TERMINATED' if reason == "sacked" else 'EXPIRED'

    def _hire_new_manager(self, session, club):
        # Find a random unemployed manager
        new_manager = session.query(Manager).filter_by(club_id=None).first()
        if not new_manager:
            # Create a new random manager
            new_manager = Manager(
                name=f"Manager {random.randint(100, 999)}",
                age=random.randint(35, 65),
                nationality="English",
                reputation=random.randint(1000, 5000),
                morale=60,
                tactical_knowledge=random.randint(8, 16),
                man_management=random.randint(8, 16)
            )
            session.add(new_manager)
            session.flush()

        new_manager.club_id = club.id

        # Create Contract
        contract = ManagerContract(
            manager_id=new_manager.id,
            club_id=club.id,
            wage=club.reputation // 10,
            start_date=datetime.datetime.now(),
            end_date=datetime.datetime.now() + datetime.timedelta(days=2*365),
            sack_compensation=(club.reputation // 10) * 6,
            status='ACTIVE'
        )
        session.add(contract)
