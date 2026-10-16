from sqlalchemy import Column,Integer,String
from .database import Base
class auth(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(200), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    first_name = Column(String(200), nullable=False)
    last_name = Column(String(200), nullable=False)