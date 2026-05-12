from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from engine.models.base import Base
from engine.utils.generator import seed_world
from engine.systems.fixture_engine import generate_fixtures
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

    def run_tick(self):
        session = self.Session()
        print("Advancing world time...")
        # 1. Process matches for the current date
        # 2. Update player development
        # 3. Process AI transfers
        session.close()

    def get_club_info(self, club_id: int):
        session = self.Session()
        from engine.models.base import Club
        club = session.query(Club).filter_by(id=club_id).first()
        data = {
            "name": club.name,
            "balance": club.balance,
            "reputation": club.reputation,
            "squad_size": len(club.players)
        }
        session.close()
        return data
