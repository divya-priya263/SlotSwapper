from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str
    events: list["Event"] = Relationship(back_populates="owner")


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    title: str
    startTime: datetime
    endTime: datetime
    status: str = "BUSY"  # BUSY, SWAPPABLE, SWAPPED

    owner: Optional[User] = Relationship(back_populates="events")
