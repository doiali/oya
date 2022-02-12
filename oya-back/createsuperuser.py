from app.models import User
from app.database import SessionLocal
from app.auth import get_password_hash
from getpass import getpass

with SessionLocal() as session:
    """"""
    username = input("enter username: ")
    password = getpass("enter password: ")
    admin_user = User(
        username=username, password=get_password_hash(password), superuser=True
    )
    session.add(admin_user)
    session.flush()
    print(admin_user)
    session.commit()
