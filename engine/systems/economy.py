from sqlalchemy.orm import Session
from engine.models.base import Club, Player
import random

class TransferSystem:
    def process_ai_transfers(self, session: Session):
        # Very simple AI: random transfers
        # Real AI would evaluate squad needs and budget
        potential_sellers = session.query(Club).filter(Club.reputation < 7000).all()
        potential_buyers = session.query(Club).filter(Club.reputation >= 7000).all()

        if not potential_sellers or not potential_buyers:
            return

        for buyer in potential_buyers:
            if buyer.balance > 2000000 and random.random() < 0.1:
                seller = random.choice(potential_sellers)
                if not seller.players: continue

                player = random.choice(seller.players)

                fee = player.ca * 10000 # Simplistic valuation
                if buyer.balance >= fee:
                    # Execute Transfer
                    buyer.balance -= fee
                    seller.balance += fee
                    player.club_id = buyer.id
                    print(f"TRANSFER: {player.name} from {seller.name} to {buyer.name} for £{fee}")

        session.commit()

class FinanceSystem:
    def process_daily_finances(self, session: Session):
        clubs = session.query(Club).all()
        for club in clubs:
            # Passive income (Sponsorships/Tickets - simplified)
            income = club.reputation * 10
            # Expenses (Wages)
            expenses = sum(p.ca * 10 for p in club.players)

            club.balance += (income - expenses)
        session.commit()
