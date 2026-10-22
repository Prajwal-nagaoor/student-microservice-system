from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Student
from .authenticate import get_current_user
from .schemas import StudentRequest, StudentResponse

app = FastAPI()

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "student fastapi is running"
    }


@app.post("/students", response_model=StudentResponse)
def add_student(student_data:StudentRequest, db:Session=Depends(get_db), current_user:dict=Depends(get_current_user)):
    exists_email = db.query(Student).filter(
        Student.email == student_data.email
    ).first()
    exists_phone = db.query(Student).filter(
        Student.ph_num == student_data.ph_num
    ).first()
    if exists_phone:
        raise HTTPException(
                    status_code=404,
                    detail="Email already exists"
                )
    if exists_email:
        raise HTTPException(
            status_code=404,
            detail="Email already exists"
        )

    new_studnet = Student(
        name = student_data.name,
        ph_num = student_data.ph_num,
        email = student_data.email,
        dept = student_data.dept,
        course = student_data.course
    )

    db.add(new_studnet)
    db.commit()
    db.refresh(new_studnet)

    return new_studnet

    
    
