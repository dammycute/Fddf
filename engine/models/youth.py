from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from engine.models.base import Base

class YouthPlayer(Base):
    __tablename__ = 'youth_players'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer)
    nationality = Column(String)
    position = Column(String)
    pa = Column(Integer) # potential only
    personality_id = Column(Integer, ForeignKey('personalities.id'), nullable=True)
    intake_season = Column(Integer)
    promoted = Column(Boolean, default=False)

    club = relationship("Club", back_populates="youth_players")
