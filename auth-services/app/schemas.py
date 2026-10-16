from pydantic import BaseModel, EmailStr

class RegiserRequest(BaseModel):
    username :str
    password : str
    email : EmailStr
    first_name : str
    last_name : str

class RegistrResponse(BaseModel):
    id : int
    username :str
    email : EmailStr
    first_name : str
    last_name : str