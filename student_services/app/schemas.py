from pydantic import BaseModel, EmailStr

class StudentRequest(BaseModel):
    name :str
    ph_num : int
    email : EmailStr
    dept : str
    course : str
    sem : int
class StudentResponse(BaseModel):
    id : int
    name :str
    ph_num : int
    email : EmailStr
    dept : str
    course : str
    sem : int

