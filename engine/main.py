import os
import sys
import json
from engine.core.simulation import SimulationEngine


def dispatch(cmd, engine):
    """Route an incoming JSON command to the appropriate engine method."""
    cmd_type = cmd.get("type")
    payload = cmd.get("payload", {})

    if cmd_type == "GET_CLUB":
        return engine.get_club_info(payload["club_id"])

    elif cmd_type == "NEXT_TICK":
        engine.run_tick()
        return {"ticked": True}

    elif cmd_type == "GET_FIXTURES":
        return engine.get_fixtures(payload["club_id"])

    elif cmd_type == "GET_LEAGUE_TABLE":
        return engine.get_league_table(payload["league_id"])

    elif cmd_type == "GET_TRANSFER_OFFERS":
        return engine.get_transfer_offers(payload["club_id"])

    elif cmd_type == "GET_MANAGER_INFO":
        return engine.get_manager_info(payload["club_id"])

    elif cmd_type == "RESPOND_TO_OFFER":
        return engine.respond_to_offer(payload["offer_id"], payload["accept"])

    elif cmd_type == "GET_MATCH_REPORT":
        return engine.get_match_report(payload["fixture_id"])

    else:
        raise ValueError(f"Unknown command: {cmd_type}")


def main():
    print("Football Chairman Simulation Engine Starting...", flush=True)
    # Initialize engine
    engine = SimulationEngine(db_path="data/game.db")

    # Persistent stdin/stdout command loop for Electron IPC
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            cmd = json.loads(line)
            result = dispatch(cmd, engine)
            print(json.dumps({"ok": True, "data": result}), flush=True)
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}), flush=True)


if __name__ == "__main__":
    main()
