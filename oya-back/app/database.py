from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config

# SQLALCHEMY_DATABASE_URL = "sqlite:///./oya.db"
SQLALCHEMY_DATABASE_URL = "postgresql://" + config('db_username') + ":" + \
                          config('db_password') + "@localhost/oya"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": True}
# )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()