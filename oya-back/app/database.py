from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from decouple import config

# SQLALCHEMY_DATABASE_URL = "sqlite:///./oya.db"
SQLALCHEMY_DATABASE_URL = (
    "postgresql://"
    + config("db_username")
    + ":"
    + config("db_password")
    + "@localhost/"
    + config("db_name")
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, future=True, echo=True)
# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": True}
# )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
