from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from engine.models.base import Base

class Season(Base):
    __tablename__ = 'seasons'
    id = Column(Integer, primary_key=True)
    league_id = Column(Integer, ForeignKey('leagues.id'), nullable=False)
    season_number = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False) # 'ACTIVE', 'COMPLETED'
    champion_club_id = Column(Integer, ForeignKey('clubs.id'), nullable=True)

class LeagueStanding(Base):
    __tablename__ = 'league_standings'
    id = Column(Integer, primary_key=True)
    season_id = Column(Integer, ForeignKey('seasons.id'), nullable=False)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    played = Column(Integer, default=0)
    won = Column(Integer, default=0)
    drawn = Column(Integer, default=0)
    lost = Column(Integer, default=0)
    gf = Column(Integer, default=0)
    ga = Column(Integer, default=0)
    gd = Column(Integer, default=0)
    points = Column(Integer, default=0)
    form = Column(JSON) # last 5 results as list of 'W'/'D'/'L'

class Rivalry(Base):
    __tablename__ = 'rivalries'
    id = Column(Integer, primary_key=True)
    club_a_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    club_b_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    intensity = Column(Integer) # 1-10
    rivalry_type = Column(String) # 'LOCAL', 'HISTORIC', 'TITLE'
