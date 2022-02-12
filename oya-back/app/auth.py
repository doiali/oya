from datetime import datetime, timedelta
from typing import List
from sqlalchemy import false, select
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from . import models
from .database import get_db

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "ec531cdaa34637c8e880a4e2adf632e90fa3b929fe514c01fab055902c882e06"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    email: str | None = None
    firstname: str | None = None
    lastname: str | None = None
    superuser: bool | None = None

    class Config:
        orm_mode = True


class User(UserBase):
    id: int


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    username: str | None
    password: str | None


class UserInDB(User):
    password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    stmt = select(models.User).where(models.User.username == username)
    db_user = db.execute(stmt).scalars().first()
    return db_user


def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db=db, username=username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db=db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def create_token(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_super_user(current_user: User = Depends(get_current_user)):
    if not current_user.superuser:
        raise HTTPException(status_code=403, detail="you don't have permission")
    return current_user


@router.post("/token", response_model=Token)
async def form_login_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    return create_token(db, form_data.username, form_data.password)


@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users/", response_model=List[User])
async def read_users(
    current_user: User = Depends(get_current_super_user), db: Session = Depends(get_db)
):
    return db.execute(select(models.User)).scalars().all()


@router.post("/users/", response_model=User)
async def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    data.password = get_password_hash(data.password)
    db_user = models.User(**data.dict())
    db.add(db_user)
    db.flush()
    db.commit()
    return db_user


@router.put("/users/{user_id}/", response_model=User)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    if data.password:
        data.password = get_password_hash(data.password)
    data = data.dict()
    db_user = db.get(models.User, user_id)
    for key in data:
        value = data[key]
        if value is not None:
            db_user.__setattr__(key, value)
    db.commit()
    return db_user

@router.delete("/users/{user_id}/",status_code=204)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    db_user = db.get(models.User, user_id)
    db.delete(db_user)
    db.commit()
