from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Stadium(Base):
    __tablename__ = 'stadiums'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    capacity = Column(Integer)

    clubs = relationship("Club", backref="stadium")

class Club(Base):
    __tablename__ = 'clubs'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    reputation = Column(Integer, default=1000)
    balance = Column(Integer, default=1000000)
    transfer_budget = Column(Integer, default=500000)
    wage_budget = Column(Integer, default=50000)

    stadium_id = Column(Integer, ForeignKey('stadiums.id'))
    training_lvl = Column(Integer, default=1)
    youth_lvl = Column(Integer, default=1)
    medical_lvl = Column(Integer, default=1)

    players = relationship("Player", back_populates="club")

class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'))
    name = Column(String, nullable=False)
    age = Column(Integer)
    nationality = Column(String)

    # Attributes stored as JSON for flexibility, or could be separate columns for performance
    attributes = Column(JSON)

    # Core stats
    ca = Column(Integer, default=100) # Current Ability
    pa = Column(Integer, default=100) # Potential Ability

    fitness = Column(Integer, default=100)
    stamina = Column(Integer, default=100)
    morale = Column(Integer, default=50)

    club = relationship("Club", back_populates="players")

class League(Base):
    __tablename__ = 'leagues'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    reputation = Column(Integer)
    country = Column(String)

class Fixture(Base):
    __tablename__ = 'fixtures'
    id = Column(Integer, primary_key=True)
    league_id = Column(Integer, ForeignKey('leagues.id'))
    home_club_id = Column(Integer, ForeignKey('clubs.id'))
    away_club_id = Column(Integer, ForeignKey('clubs.id'))
    date = Column(DateTime)
    status = Column(String, default='SCHEDULED') # SCHEDULED, PLAYED
    home_goals = Column(Integer)
    away_goals = Column(Integer)
    match_report_id = Column(String)

class GameMeta(Base):
    __tablename__ = 'game_meta'
    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String)
