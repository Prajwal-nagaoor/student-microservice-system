from fastapi import FastAPI
from .database import Base, engine
from .models import Student
app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message":"student fastapi is running"
    }