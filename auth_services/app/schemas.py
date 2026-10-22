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
class LoginRequest(BaseModel):
    username : str | None = None
    email : str | None = None
    password : str

class LoginResponse(BaseModel):
    id : int
    username :str
    email : EmailStr
    first_name : str
    last_name : str
class profle_response(BaseModel):
    id : int
    username :str
    email : EmailStr
    first_name : str
    last_name : str
    
