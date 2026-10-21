from sqlalchemy import Column, String, Integer
from .database import Base


class Depatment(Base):

    __tablename__ = "department"
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(50), nullable=False)

class Coursse(Base):

    __tablename__ = "course"
    id = Column(Integer, primary_key=True, index=True)
    course = Column(String(100), nullable=False)
    