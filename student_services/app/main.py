from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Student
from .authenticate import get_current_user
from .schemas import StudentRequest, StudentResponse, update_stu_request

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
@app.get("/all-student", response_model=list[StudentResponse])
def get_all_student(db:Session=Depends(get_db), current_user:dict=Depends(get_current_user)):
    all_student = db.query(Student).all()

    if all_student is None:
        raise HTTPException(
            status_code=404,
            detail="No Student found"
        )

    return all_student

@app.get("/get-student", response_model=StudentResponse)
def get_id_student(stu_id:int,db:Session=Depends(get_db), current_user:dict=Depends(get_current_user)):
    student = db.query(Student).filter(
        Student.id == stu_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=400,
            detail="Student not found or invalid student id"
        )

    return student

@app.put("/update-student", response_model=StudentResponse)
def update_student(update_data:update_stu_request,db:Session=Depends(get_db), current_user:dict=Depends(get_current_user)):
    student = db.query(Student).filter(
        Student.id == update_data.id
    ).first()

    if not student:
        raise HTTPException(
            status_code= 404,
            detail="student not found or invalid student id"
        )
    email_exists = db.query(Student).filter(
        Student.email == update_data.email
    ).first()

    if email_exists:
        raise HTTPException(
            status_code=404,
            detail="Email already exists, try with different email"
        )

    ph_num_exists = db.query(Student).filter(
        Student.ph_num == update_data.ph_num
    ).first()

    if ph_num_exists:
        raise HTTPException(
            status_code=404,
            detail="Phone number already exists try with different phone number"
        )

    student.name = update_data.name
    student.email = update_data.email
    student.ph_num = update_data.ph_num
    student.dept = update_data.dept
    student.course = update_data.course

    db.commit()
    db.refresh(student)

    return student

@app.delete("/delete-student")
def delete_student(stu_id:int, db:Session=Depends(get_db), current_user:dict=Depends(get_current_user)):
    student = db.query(Student).filter(
        Student.id == stu_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Studnet not found"
        )

    db.delete(student)
    db.commit()

    return {
       "Message":"Student got deleted successfully"
    }