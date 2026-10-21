from sqlalchemy import Column, String, Integer
from .database import Base
class Student(Base):

    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    ph_num = Column(Integer, nullable=False)
    dept = Column(String(200), nullable=False)
    course = Column(String(200), nullable=False)
    sem = Column(Integer, nullable=False, default=1)