from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
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
    date = Column(DateTime, default=datetime.datetime.now)
    importance = Column(Integer, default=1)
