from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import Base,engine, get_db
from .models import auth
from .schemas import RegiserRequest,RegistrResponse, LoginRequest,LoginResponse, profle_response
from .authenticate import hashpassword, verify_password, create_access_token,verify_access_token, get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)
@app.get("/")
def home():
    return {
        "Message":"Fastapi server is running successfully"
    }
@app.post("/register", response_model=RegistrResponse)
def register(data:RegiserRequest,db:Session=Depends(get_db)):
    if not data.username or not data.password or not data.email or not data.first_name or not data.last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields needs to be filled"
        )
    username_exists = db.query(auth).filter(
        auth.username == data.username
    ).first()

    if username_exists:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="This username is already exists, try different username"
        )
    email_exists = db.query(auth).filter(
        auth.email == data.email
    ).first()

    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists, try another email"
        )

    new_user = auth(
        username = data.username,
        email = data.email,
        first_name = data.first_name,
        last_name = data.last_name,
        password = hashpassword(data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/login")
def login(logindata:LoginRequest, db:Session=Depends(get_db)):
    user_exists = db.query(auth).filter(
        auth.username == logindata.username
    ).first()

    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid username  or password"
        )

    if not verify_password(logindata.password,user_exists.password):
        raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid username  or password"
            )
    access_token = create_access_token(
        {"user_id":user_exists.id,
         "email":user_exists.email,}
    )

    return {
        "Message":"Login Successfull",
        "user_id":user_exists.id,
        "Username":user_exists.username,
        "Email":user_exists.email,
        "access token":access_token
    }
@app.get("/profile", response_model=profle_response)
def profile(db:Session=Depends(get_db), current_user:auth=Depends(get_current_user) ):
    return current_user
    
    