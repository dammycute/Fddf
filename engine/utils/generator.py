import random
from engine.models.base import Club, Player, League, Stadium
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

        # Generate players for each club
        for _ in range(22):
            player = generate_player(club_id=club.id)
            session.add(player)

    session.commit()
