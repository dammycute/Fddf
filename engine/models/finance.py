from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from engine.models.base import Base

class FinancialRecord(Base):
    __tablename__ = 'financial_records'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    date = Column(DateTime, nullable=False)
    record_type = Column(String, nullable=False) # 'WAGE', 'TRANSFER_IN', 'TRANSFER_OUT', 'TICKET', 'SPONSORSHIP', 'TV_RIGHTS', 'OTHER'
    amount = Column(Integer, nullable=False) # positive = income, negative = expense
    description = Column(String)

    club = relationship("Club", back_populates="financial_records")

class Sponsorship(Base):
    __tablename__ = 'sponsorships'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False)
    sponsor_name = Column(String, nullable=False)
    amount_per_season = Column(Integer, nullable=False)
    start_season = Column(Integer, nullable=False)
    end_season = Column(Integer, nullable=False)
    status = Column(String, nullable=False) # 'ACTIVE', 'EXPIRED'
