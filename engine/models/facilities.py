from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from engine.models.base import Base

class Facilities(Base):
    __tablename__ = 'facilities'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'), unique=True, nullable=False)
    training_level = Column(Integer, default=1) # 1-5
    medical_level = Column(Integer, default=1) # 1-5
    youth_level = Column(Integer, default=1) # 1-5
    training_upgrade_cost = Column(Integer, default=0)
    medical_upgrade_cost = Column(Integer, default=0)
    youth_upgrade_cost = Column(Integer, default=0)
    upgrade_in_progress = Column(JSON, nullable=True) # e.g. {"type": "training", "complete_date": "2024-08-01"}

    club = relationship("Club", back_populates="facilities")
