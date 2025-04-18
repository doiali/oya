from app.models import User
from app.database import SessionLocal
from app.controllers.auth import get_password_hash
from getpass import getpass
from sqlalchemy import select


with SessionLocal() as session:
    """
        Finds a user and sets the password for that user.
        Throws an error if the user is not found
    """
    username = input("enter username: ")
    password = getpass("enter password: ")
    user = session.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        print("User not found.")
    else:
        hashed_password = get_password_hash(password)
        user.password = hashed_password
        session.add(user)
        session.commit()
        print("Password updated successfully.")
