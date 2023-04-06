from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, routers
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3022",
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.auth)
app.include_router(routers.main)
app.include_router(routers.report, prefix='/report')