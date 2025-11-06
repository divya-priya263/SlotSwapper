from pydantic import BaseModel

class SlotBase(BaseModel):
    slot: str
    user: str

class SlotCreate(SlotBase):
    pass

class Slot(SlotBase):
    id: int

    class Config:
        orm_mode = True
