from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from engine.models.base import Base

class Manager(Base):
    __tablename__ = 'managers'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    nationality = Column(String)
    tactical_style = Column(JSON) # e.g. {"preferred_formation": "4-3-3", "style": "pressing"}
    reputation = Column(Integer, default=0) # 0-10000
    preferred_formations = Column(JSON) # list of strings
    man_management = Column(Integer) # 1-20
    tactical_knowledge = Column(Integer) # 1-20
    youth_development = Column(Integer) # 1-20
    ambition = Column(Integer) # 1-20
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=True)
    morale = Column(Integer, default=50) # 0-100
    demands = Column(JSON) # e.g. {"transfer_budget": 5000000, "promises": ["sign_striker"]}

    club = relationship("Club", back_populates="manager")
    contract = relationship("ManagerContract", back_populates="manager", uselist=False)

class Scout(Base):
    __tablename__ = 'scouts'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    ability = Column(Integer) # 1-20
    judgment = Column(Integer) # 1-20
    network = Column(JSON) # list of country strings

    club = relationship("Club", back_populates="scouts")
