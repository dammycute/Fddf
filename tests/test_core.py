import pytest
import os
from engine.core.simulation import SimulationEngine

def test_engine_initialization():
    db_path = "data/test_game.db"
    if os.path.exists(db_path):
        os.remove(db_path)

    engine = SimulationEngine(db_path)
    assert os.path.exists(db_path)

    # Test getting club info (there should be 4 clubs from the seeder)
    club_info = engine.get_club_info(1)
    assert club_info['name'] is not None
    assert club_info['squad_size'] == 22

    os.remove(db_path)
