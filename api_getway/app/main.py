
from fastapi import FastAPI, Request, Depends
from fastapi.responses import Response, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
import httpx

app = FastAPI(title="Student Management API Gateway", version="1.0.0")

AUTH_URL = "http://127.0.0.1:8000"
STUDENT_URL = "http://127.0.0.1:8001"
COURSE_URL = "http://127.0.0.1:8002"

bearer = HTTPBearer(auto_error=True)


# =============== SCHEMAS ===============

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: EmailStr
    first_name: str
    last_name: str


class LoginRequest(BaseModel):
    username: str
    password: str


class StudentRequest(BaseModel):
    name: str = Field(..., min_length=1)
    ph_num: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    dept: str
    course: str


class UpdateStudentRequest(BaseModel):
    id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1)
    ph_num: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    dept: str
    course: str


# =============== REQUEST FORWARDER ===============

async def forward_request(request: Request, url: str):
    body = await request.body()

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {
            "host", "content-length", "connection",
            "transfer-encoding"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=url,
                params=request.query_params,
                content=body,
                headers=headers
            )
    except httpx.RequestError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Backend service unavailable",
                "reason": str(exc)
            }
        )

    excluded = {
        "content-encoding", "content-length",
        "transfer-encoding", "connection"
    }

    response_headers = {
        key: value
        for key, value in response.headers.items()
        if key.lower() not in excluded
    }

    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=response_headers,
        media_type=response.headers.get("content-type")
    )


# =============== HOME ===============

@app.get("/", tags=["Home"])
def home():
    return {"message": "API Gateway is running"}


# =============== AUTHENTICATION ===============

@app.post("/auth/register", tags=["Authentication"])
async def register(data: RegisterRequest, request: Request):
    return await forward_request(request, f"{AUTH_URL}/register")


@app.post("/auth/login", tags=["Authentication"])
async def login(data: LoginRequest, request: Request):
    return await forward_request(request, f"{AUTH_URL}/login")


@app.get("/auth/profile", tags=["Authentication"])
async def my_profile(
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{AUTH_URL}/profile")


# =============== STUDENTS ===============

@app.post("/students", tags=["Students"])
async def create_student(
    data: StudentRequest,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{STUDENT_URL}/students")


@app.get("/all-student", tags=["Students"])
async def list_students(
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{STUDENT_URL}/all-student")


@app.get("/get-student", tags=["Students"])
async def get_student(
    stu_id: int,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{STUDENT_URL}/get-student")


@app.put("/update-student", tags=["Students"])
async def update_student(
    data: UpdateStudentRequest,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{STUDENT_URL}/update-student")


@app.delete("/delete-student", tags=["Students"])
async def delete_student(
    stu_id: int,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{STUDENT_URL}/delete-student")


# =============== DEPARTMENTS ===============

@app.post("/add-dept", tags=["Departments"])
async def add_department(
    dept_name: str,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{COURSE_URL}/add-dept")


@app.get("/departments", tags=["Departments"])
async def list_departments(
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{COURSE_URL}/departments")


# =============== COURSES ===============

@app.post("/add-course", tags=["Courses"])
async def add_course(
    course_name: str,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{COURSE_URL}/add-course")


@app.get("/courses", tags=["Courses"])
async def list_courses(
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(request, f"{COURSE_URL}/courses")


@app.get("/courses/{course_id}", tags=["Courses"])
async def get_course(
    course_id: int,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(
        request, f"{COURSE_URL}/courses/{course_id}"
    )


@app.delete("/courses/{course_id}", tags=["Courses"])
async def delete_course(
    course_id: int,
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer)
):
    return await forward_request(
        request, f"{COURSE_URL}/courses/{course_id}"
    )
