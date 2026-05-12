from sqlalchemy.orm import Session
from engine.models.history import NewsEvent
import datetime

class StorytellingEngine:
    def trigger_emergent_stories(self, session: Session):
        # Check for interesting patterns in the DB
        # Example: Check for giant killings, financial collapses, etc.
        pass

    def generate_news(self, session: Session, title: str, content: str):
        news = NewsEvent(title=title, content=content, date=datetime.datetime.now())
        session.add(news)
        session.commit()
