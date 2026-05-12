from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from engine.models.base import Base

class TransferOffer(Base):
    __tablename__ = 'transfer_offers'
    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey('players.id'), nullable=False)
    from_club_id = Column(Integer, ForeignKey('clubs.id'), nullable=True)
    to_club_id = Column(Integer, ForeignKey('clubs.id'), nullable=True)
    fee = Column(Integer, nullable=False)
    status = Column(String, nullable=False) # 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    created_date = Column(DateTime, nullable=False)
    resolved_date = Column(DateTime, nullable=True)
    installments = Column(Integer, default=1)
    is_loan = Column(Boolean, default=False)

    player = relationship("Player", back_populates="transfer_offers")

class ScoutReport(Base):
    __tablename__ = 'scout_reports'
    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey('players.id'), nullable=False)
    scout_id = Column(Integer, ForeignKey('scouts.id'), nullable=False)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    created_date = Column(DateTime, nullable=False)
    ca_estimate = Column(Integer)
    pa_estimate = Column(Integer)
    notes = Column(String)
    attributes_snapshot = Column(JSON)
