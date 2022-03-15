from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from .. import models
from ..database import get_db
from ..schemas import auth
from ..controllers.auth import (
    create_token,
    get_current_user,
    get_current_super_user,
    get_password_hash,
)


router = APIRouter()


@router.post("/token", tags=["Token"], response_model=auth.Token)
async def form_login_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    return create_token(db, form_data.username, form_data.password)


@router.get("/users/me/", tags=["Users"], response_model=auth.User)
async def read_users_me(current_user: auth.User = Depends(get_current_user)):
    return current_user


@router.get("/users/", tags=["Users"], response_model=List[auth.User])
async def read_users(
    current_user: auth.User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    return db.execute(select(models.User)).scalars().all()


@router.post("/users/", tags=["Users"], response_model=auth.User)
async def create_user(
    data: auth.UserCreate,
    current_user: auth.User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    data.password = get_password_hash(data.password)
    db_user = models.User(**data.dict())
    db.add(db_user)
    db.flush()
    db.commit()
    return db_user


@router.put("/users/{user_id}/", tags=["Users"], response_model=auth.User)
async def update_user(
    user_id: int,
    data: auth.UserUpdate,
    current_user: auth.User = Depends(get_current_super_user),
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


@router.delete("/users/{user_id}/", tags=["Users"], status_code=204)
async def delete_user(
    user_id: int,
    current_user: auth.User = Depends(get_current_super_user),
    db: Session = Depends(get_db),
):
    db_user = db.get(models.User, user_id)
    db.delete(db_user)
    db.commit()
