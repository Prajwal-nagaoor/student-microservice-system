from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Depatment, Coursse
from .schemas import Dept_res, Course_res

app = FastAPI(title="Department and Course Service")

# Create database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Course FastAPI is running"
    }


# Create Department
@app.post("/add-dept", response_model=Dept_res)
def create_dept(
    dept_name: str,
    db: Session = Depends(get_db)
):
    dept_exists = db.query(Depatment).filter(
        Depatment.department == dept_name
    ).first()

    if dept_exists:
        raise HTTPException(
            status_code=409,
            detail="Department already exists"
        )

    new_dept = Depatment(
        department=dept_name
    )

    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)

    return new_dept


# Get All Departments
@app.get("/departments", response_model=list[Dept_res])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Depatment).all()


# Create Course
@app.post("/add-course", response_model=Course_res)
def create_course(
    course_name: str,
    db: Session = Depends(get_db)
):
    course_exists = db.query(Coursse).filter(
        Coursse.course == course_name
    ).first()

    if course_exists:
        raise HTTPException(
            status_code=409,
            detail="Course already exists"
        )

    new_course = Coursse(
        course=course_name
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


# Get All Courses
@app.get("/courses", response_model=list[Course_res])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Coursse).all()


# Get Course by ID
@app.get("/courses/{course_id}", response_model=Course_res)
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Coursse).filter(
        Coursse.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


# Delete Course
@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Coursse).filter(
        Coursse.id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }
