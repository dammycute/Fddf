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

    elif cmd_type == "LIST_PLAYER":
        return engine.list_player(payload["player_id"], payload["fee"])

    elif cmd_type == "GET_MATCH_REPORT":
        return engine.get_match_report(payload["fixture_id"])

    elif cmd_type == "GET_SQUAD":
        return engine.get_squad(payload["club_id"])

    elif cmd_type == "GET_FACILITIES":
        return engine.get_facilities(payload["club_id"])

    elif cmd_type == "GET_YOUTH":
        return engine.get_youth_players(payload["club_id"])

    elif cmd_type == "GET_NEWS_FEED":
        return engine.get_news_feed(payload.get("limit", 20))

    elif cmd_type == "GET_CLUB_HISTORY":
        return engine.get_club_history(payload["club_id"])

    elif cmd_type == "GET_FINANCIALS":
        return engine.get_financials(payload["club_id"])

    elif cmd_type == "UPGRADE_FACILITY":
        return engine.upgrade_facility(payload["club_id"], payload["type"])

    elif cmd_type == "PROMOTE_YOUTH":
        return engine.promote_youth(payload["club_id"], payload["youth_player_id"])

    elif cmd_type == "REMOVE_FROM_LIST":
        return engine.remove_from_list(payload["club_id"], payload["player_id"])

    elif cmd_type == "GET_SCOUT_REPORTS":
        return engine.get_scout_reports(payload["club_id"])

    elif cmd_type == "GET_FAN_SENTIMENT":
        return engine.get_fan_sentiment(payload["club_id"])

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
            request_id = cmd.get("request_id")
            result = dispatch(cmd, engine)
            print(json.dumps({"ok": True, "data": result, "request_id": request_id}), flush=True)
        except Exception as e:
            request_id = cmd.get("request_id") if 'cmd' in locals() else None
            print(json.dumps({"ok": False, "error": str(e), "request_id": request_id}), flush=True)


if __name__ == "__main__":
    main()
