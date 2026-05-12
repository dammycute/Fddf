from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from engine.models.base import Base

class PlayerContract(Base):
    __tablename__ = 'player_contracts'
    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey('players.id'), nullable=False)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    wage = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    release_clause = Column(Integer, nullable=True)
    status = Column(String, nullable=False) # 'ACTIVE', 'EXPIRED', 'TERMINATED'

    player = relationship("Player", back_populates="contract")
    club = relationship("Club", back_populates="contracts")

class ManagerContract(Base):
    __tablename__ = 'manager_contracts'
    id = Column(Integer, primary_key=True)
    manager_id = Column(Integer, ForeignKey('managers.id'), nullable=False)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    wage = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    sack_compensation = Column(Integer, nullable=False)
    status = Column(String, nullable=False) # 'ACTIVE', 'EXPIRED', 'TERMINATED'

    manager = relationship("Manager", back_populates="contract")
