import os
import sys
from engine.core.simulation import SimulationEngine

def main():
    print("Football Chairman Simulation Engine Starting...")
    # Initialize engine
    # In a real scenario, this would listen for IPC/stdin commands
    engine = SimulationEngine(db_path="data/game.db")

if __name__ == "__main__":
    main()
