import random
import datetime
from engine.models import (
    Club, Player, League, Stadium, Facilities, Manager,
    ManagerContract, PlayerContract, Sponsorship, YouthPlayer
)
from sqlalchemy.orm import Session

def generate_player(club_id=None):
    first_names = ["John", "David", "Michael", "Chris", "Kevin", "Mark", "Paul"]
    last_names = ["Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson"]

    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    age = random.randint(16, 35)
    ca = random.randint(50, 150)
    pa = ca + random.randint(0, 50)

    return Player(
        name=name,
        age=age,
        club_id=club_id,
        ca=ca,
        pa=pa,
        attributes={
            "finishing": random.randint(1, 20),
            "passing": random.randint(1, 20),
            "tackling": random.randint(1, 20),
            "pace": random.randint(1, 20)
        }
    )

def seed_world(session: Session):
    # Create a basic league
    league = League(name="Premier League", reputation=90, country="England")
    session.add(league)
    session.flush()

    # Create some clubs
    club_names = ["London FC", "Manchester Blues", "Liverpool Reds", "Birmingham Lions"]
    for name in club_names:
        stadium = Stadium(
            name=f"{name} Stadium",
            capacity=random.randint(15000, 75000)
        )
        session.add(stadium)
        session.flush()

        club = Club(name=name, stadium_id=stadium.id, reputation=random.randint(5000, 8000))
        session.add(club)
        session.flush()

        # TASK 9 - Create related records
        # Facilities
        fac_lvl = random.randint(1, 3) if club.reputation < 7000 else random.randint(3, 5)
        facilities = Facilities(
            club_id=club.id,
            training_level=fac_lvl,
            medical_level=fac_lvl,
            youth_level=fac_lvl,
            training_upgrade_cost=fac_lvl * 500000,
            medical_upgrade_cost=fac_lvl * 500000,
            youth_upgrade_cost=fac_lvl * 500000
        )
        session.add(facilities)

        # Manager
        manager = Manager(
            name=f"Manager {club.name}",
            age=random.randint(35, 65),
            nationality="English",
            reputation=random.randint(1000, 8000),
            club_id=club.id,
            tactical_style={"preferred_formation": "4-4-2", "style": "balanced"},
            preferred_formations=["4-4-2", "4-3-3"],
            man_management=random.randint(10, 18),
            tactical_knowledge=random.randint(10, 18),
            youth_development=random.randint(10, 18),
            ambition=random.randint(10, 18),
            morale=80
        )
        session.add(manager)
        session.flush()

        # Manager Contract
        start_date = datetime.datetime.now()
        end_date = start_date + datetime.timedelta(days=3*365)
        manager_contract = ManagerContract(
            manager_id=manager.id,
            club_id=club.id,
            wage=club.reputation // 10,
            start_date=start_date,
            end_date=end_date,
            sack_compensation=(club.reputation // 10) * 12,
            status='ACTIVE'
        )
        session.add(manager_contract)

        # Sponsorship
        sponsorship = Sponsorship(
            club_id=club.id,
            sponsor_name="Global Corp",
            amount_per_season=club.reputation * 500,
            start_season=1,
            end_season=3,
            status='ACTIVE'
        )
        session.add(sponsorship)

        # 5 YouthPlayer records
        for _ in range(5):
            youth = YouthPlayer(
                club_id=club.id,
                name=f"Youth {random.randint(1, 1000)}",
                age=random.randint(15, 18),
                nationality="English",
                position=random.choice(["GK", "DEF", "MID", "FWD"]),
                pa=random.randint(120, 180),
                intake_season=1
            )
            session.add(youth)

        # Generate players for each club
        for _ in range(22):
            player = generate_player(club_id=club.id)
            session.add(player)
            session.flush()

            # Player Contract
            p_start_date = datetime.datetime.now()
            p_end_date = p_start_date + datetime.timedelta(days=random.randint(2, 4)*365)
            player_contract = PlayerContract(
                player_id=player.id,
                club_id=club.id,
                wage=player.ca * 50,
                start_date=p_start_date,
                end_date=p_end_date,
                status='ACTIVE'
            )
            session.add(player_contract)

    session.commit()
