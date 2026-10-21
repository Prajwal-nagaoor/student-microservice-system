from pydantic import BaseModel

class Dept_res(BaseModel):
    id : int
    department : str

class Course_res(BaseModel):
    id : int
    course : str

