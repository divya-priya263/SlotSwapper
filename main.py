from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session, select
from datetime import datetime, timedelta
from database import create_db_and_tables, get_session, engine
from models import User, Event, SwapRequest
from pydantic import BaseModel

# -------------------- CONFIG --------------------
SECRET_KEY = "yoursecretkey"  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

app = FastAPI(title="SlotSwapper API")


from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def authenticate_user(email: str, password: str, session: Session):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return None
    if not verify_password(password[:72], user.password):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

# ------------------- LOGIN -------------------
@app.post("/api/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
# -------------------- CORS --------------------
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- STARTUP --------------------
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# -------------------- AUTH UTILS --------------------
def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

# -------------------- SCHEMAS --------------------
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    
    



class SwapRequestCreate(BaseModel):
    mySlotId: int
    theirSlotId: int


class SwapResponse(BaseModel):
    accept: bool

class UserLogin(BaseModel):
    email: str
    password: str

# -------------------- ROUTES --------------------
@app.post("/api/signup")
def signup(user: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    db_user = User(name=user.name, email=user.email, password=hashed_pw)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return {
        "message": "Signup successful",
        "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email},
    }
@app.get("/api/users")
def list_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users



@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


# -------------------- REST OF YOUR CODE --------------------
class EventCreate(BaseModel):
    title: str
    startTime: datetime
    endTime: datetime
    status: str = "BUSY"

@app.post("/api/events")
def create_event(event: EventCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    new_event = Event(
        owner_id=user.id,
        title=event.title,
        startTime=event.startTime,
        endTime=event.endTime,
        status=event.status
    )
    session.add(new_event)
    session.commit()
    session.refresh(new_event)
    return {"message": "Event created successfully!", "event": new_event}

@app.get("/api/events")
def list_my_events(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    events = session.exec(select(Event).where(Event.owner_id == user.id)).all()
    return {"events": events}


@app.get("/api/swappable-slots")
def list_swappable_slots(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(
        select(Event).where(Event.status == "SWAPPABLE", Event.owner_id != user.id)
    ).all()


@app.post("/api/swap-request")
def request_swap(
    data: SwapRequestCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    my_slot = session.get(Event, data.mySlotId)
    their_slot = session.get(Event, data.theirSlotId)
    if not my_slot or not their_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if my_slot.status != "SWAPPABLE" or their_slot.status != "SWAPPABLE":
        raise HTTPException(status_code=400, detail="One of the slots is not swappable")

    swap = SwapRequest(
        requester_id=user.id,
        receiver_id=their_slot.owner_id,
        requester_slot_id=my_slot.id,
        receiver_slot_id=their_slot.id,
        status="PENDING",
    )
    my_slot.status = their_slot.status = "SWAP_PENDING"
    session.add(swap)
    session.commit()
    return {"message": "Swap request created"}


@app.post("/api/swap-response/{request_id}")
def respond_swap(
    request_id: int,
    body: SwapResponse,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    swap = session.get(SwapRequest, request_id)
    if not swap or swap.receiver_id != user.id:
        raise HTTPException(status_code=404, detail="Swap not found or unauthorized")

    my_slot = session.get(Event, swap.receiver_slot_id)
    their_slot = session.get(Event, swap.requester_slot_id)

    if body.accept:
        swap.status = "ACCEPTED"
        my_slot.owner_id, their_slot.owner_id = their_slot.owner_id, my_slot.owner_id
        my_slot.status = their_slot.status = "BUSY"
    else:
        swap.status = "REJECTED"
        my_slot.status = their_slot.status = "SWAPPABLE"

    session.commit()
    return {"message": f"Swap {swap.status.lower()}"}


# ---------- LOGIN ----------
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "mysecretkey"  # 🔒 replace with strong random string
ALGORITHM = "HS256"

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not pwd_context.verify(form_data.password[:72], user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # ✅ Generate JWT token
    access_token_expires = timedelta(hours=2)
    access_token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + access_token_expires},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


from fastapi import APIRouter

# Optional: only allow admins to see all users
@app.get("/api/users")
def list_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Example: only allow a user with a certain email to view all users
    if current_user.email != "admin@example.com":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = session.exec(select(User)).all()
    return [{"id": u.id, "name": u.name, "email": u.email} for u in users]

@app.get("/")
def root():
    return {"message": "✅ SlotSwapper API running successfully!"}
