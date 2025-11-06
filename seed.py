from sqlmodel import Session
from database import engine, create_db_and_tables
from models import User, Event
from datetime import datetime, timedelta
import hashlib


def hash_password(password: str):
    """Simple hash for demonstration (not for production)"""
    return hashlib.sha256(password.encode()).hexdigest()


def seed_data():
    create_db_and_tables()

    with Session(engine) as session:
        # Check if already seeded
        if session.query(User).first():
            print("Database already has data — skipping seeding.")
            return

        # Create demo users
        user1 = User(name="Divya", email="divya@example.com", password=hash_password("1234"))
        user2 = User(name="Priya", email="priya@example.com", password=hash_password("abcd"))

        session.add_all([user1, user2])
        session.commit()

        # Create demo events
        now = datetime.utcnow()
        event1 = Event(
            title="Morning Yoga",
            start_time=now,
            end_time=now + timedelta(hours=1),
            owner_id=user1.id,
            status="SWAPPABLE"
        )
        event2 = Event(
            title="Office Meeting",
            start_time=now + timedelta(hours=2),
            end_time=now + timedelta(hours=3),
            owner_id=user2.id,
            status="BUSY"
        )

        session.add_all([event1, event2])
        session.commit()

        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    seed_data()
