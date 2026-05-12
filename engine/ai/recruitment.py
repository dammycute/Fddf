import datetime
from sqlalchemy.orm import Session
from engine.models import Club, Player, TransferOffer, FinancialRecord, NewsEvent
from engine.ai.squad_evaluator import SquadEvaluator

class RecruitmentAI:
    """AI transfer logic. Called on transfer window ticks (every 90 days)."""

    def process(self, session: Session):
        clubs = session.query(Club).all()
        for club in clubs:
            self._evaluate_club(session, club)
        session.commit()

    def _evaluate_club(self, session: Session, club: Club):
        evaluator = SquadEvaluator()
        report = evaluator.evaluate(session, club)

        # Identification of targets
        for pos in report['weaknesses']:
            target_ca_range = (0, 0)
            if club.reputation < 3000:
                target_ca_range = (60, 90)
            elif club.reputation < 6000:
                target_ca_range = (90, 120)
            else:
                target_ca_range = (120, 200)

            # Find best available player
            # For simplicity, we search for players either without a club or at a lower reputation club
            # and who play the required position
            query = session.query(Player).filter(
                Player.ca >= target_ca_range[0],
                Player.ca <= target_ca_range[1]
            )

            # Position filter logic (approximate as in evaluator)
            # This is slow, but for a simulation tick it's manageable.
            # In production we'd have a 'position' column.
            potential_targets = query.all()

            best_player = None
            for p in potential_targets:
                # Check position
                p_pos = p.attributes.get('position') if p.attributes else None
                # If no position, we could skip or assume they fit if the index matches (hard to do here)
                # Let's assume some players have positions from seed or use the same round-robin logic for check
                if not p_pos:
                    # We can't easily check round-robin without knowing their index in THEIR club
                    # Let's skip players without explicit position for now to be safe,
                    # or just take the best CA one if we're desperate.
                    continue

                if p_pos != pos:
                    continue

                # Eligibility check: no club or lower reputation club
                if p.club_id is not None:
                    other_club = p.club
                    if other_club.reputation >= club.reputation:
                        continue

                if not best_player or p.ca > best_player.ca:
                    best_player = p

            if best_player:
                fee_estimate = best_player.ca * 8000
                if club.transfer_budget >= fee_estimate:
                    offer = TransferOffer(
                        player_id=best_player.id,
                        from_club_id=club.id,
                        to_club_id=best_player.club_id if best_player.club_id else None,
                        fee=fee_estimate,
                        status='PENDING',
                        created_date=datetime.datetime.now(),
                        is_loan=False
                    )
                    session.add(offer)

        # Ambition check
        if club.reputation >= 7000 and report['aging_risk']:
            # Target a young player (age <= 24)
            young_target = (
                session.query(Player)
                .filter(Player.age <= 24, Player.ca >= 120)
                .filter((Player.club_id == None) | (session.query(Club.reputation).filter(Club.id == Player.club_id).scalar_subquery() < club.reputation))
                .order_by(Player.ca.desc())
                .first()
            )
            if young_target and club.transfer_budget >= young_target.ca * 8000:
                 offer = TransferOffer(
                    player_id=young_target.id,
                    from_club_id=club.id,
                    to_club_id=young_target.club_id,
                    fee=young_target.ca * 8000,
                    status='PENDING',
                    created_date=datetime.datetime.now()
                )
                 session.add(offer)

        # Surplus listing
        if report['surplus_positions']:
            for pos in report['surplus_positions']:
                # Find worst player in this position to sell
                worst_player = None
                for p in club.players:
                    p_pos = p.attributes.get('position') if p.attributes else None
                    if p_pos == pos and (not worst_player or p.ca < worst_player.ca):
                        worst_player = p

                if worst_player:
                    # Create listing (to_club is None, status 'LISTED')
                    listing = TransferOffer(
                        player_id=worst_player.id,
                        from_club_id=club.id,
                        to_club_id=None,
                        fee=worst_player.ca * 7000,
                        status='LISTED',
                        created_date=datetime.datetime.now()
                    )
                    session.add(listing)

    def _resolve_offers(self, session: Session):
        """Resolve all PENDING offers."""
        pending = session.query(TransferOffer).filter_by(status='PENDING').all()
        for offer in pending:
            # Skip if either club is player-controlled (assuming club 1 is player)
            # In a real scenario, we'd check a 'is_player' flag on Club.
            if offer.from_club_id == 1 or offer.to_club_id == 1:
                continue

            player = session.get(Player, offer.player_id)
            buyer = session.get(Club, offer.from_club_id)
            seller = session.get(Club, offer.to_club_id) if offer.to_club_id else None

            # Acceptance logic
            accepted = False
            if not seller:
                # Free agent always accepts if fee is offered (though fee to who? Usually free agents have no fee)
                # But here we simulate a fee. Let's say they accept.
                accepted = True
            else:
                # Selling club accepts if fee >= player.ca * 7000
                # Selling club rejects if player.morale > 70 and club.reputation > buyer reputation
                if offer.fee >= player.ca * 7000:
                    accepted = True
                    if player.morale > 70 and seller.reputation > buyer.reputation:
                        accepted = False

            if accepted:
                self._execute_transfer(session, offer, player, buyer, seller)
            else:
                offer.status = 'REJECTED'
                offer.resolved_date = datetime.datetime.now()

        session.commit()

    def _execute_transfer(self, session, offer, player, buyer, seller):
        # Move player
        old_club_name = seller.name if seller else "Free Agency"
        player.club_id = buyer.id

        # Deduct fee from buyer
        buyer.balance -= offer.fee
        buyer.transfer_budget -= offer.fee

        # Add fee to seller
        if seller:
            seller.balance += offer.fee
            seller.transfer_budget += offer.fee

        offer.status = 'ACCEPTED'
        offer.resolved_date = datetime.datetime.now()

        # Financial Records
        session.add(FinancialRecord(
            club_id=buyer.id,
            date=offer.resolved_date,
            record_type='TRANSFER_IN',
            amount=-offer.fee,
            description=f"Bought {player.name} from {old_club_name}"
        ))
        if seller:
            session.add(FinancialRecord(
                club_id=seller.id,
                date=offer.resolved_date,
                record_type='TRANSFER_OUT',
                amount=offer.fee,
                description=f"Sold {player.name} to {buyer.name}"
            ))

        # News Event
        session.add(NewsEvent(
            title="Transfer News",
            content=f"{player.name} has joined {buyer.name} from {old_club_name} for £{offer.fee:,}",
            date=offer.resolved_date,
            importance=2
        ))
