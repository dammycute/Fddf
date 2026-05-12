from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from engine.models.base import Base

class Personality(Base):
    __tablename__ = 'personalities'
    id = Column(Integer, primary_key=True)
    professionalism = Column(Integer, default=10) # 1-20
    ambition = Column(Integer, default=10)
    loyalty = Column(Integer, default=10)
    pressure = Column(Integer, default=10)
    ego = Column(Integer, default=10)

# We would link this to Player model in a real migration
