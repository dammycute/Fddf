from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Float
from engine.models.base import Base
import datetime

class ClubHistory(Base):
    __tablename__ = 'club_history'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'))
    season = Column(Integer)
    achievement = Column(String)
    data = Column(JSON) # Store records, key matches

class NewsEvent(Base):
    __tablename__ = 'news_events'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    importance = Column(Integer, default=1)

class MatchReport(Base):
    __tablename__ = 'match_reports'
    id = Column(Integer, primary_key=True)
    fixture_id = Column(Integer, ForeignKey('fixtures.id'), unique=True)
    home_possession = Column(Float)
    away_possession = Column(Float)
    home_shots = Column(Integer)
    away_shots = Column(Integer)
    events = Column(JSON) # the events list
