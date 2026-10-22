from .database import get_db
import bcrypt
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone,timedelta
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .models import auth
SECRET_KEY = "my-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer()
def hashpassword(plainpasword: str) -> str:
    hashed = bcrypt.hashpw(
        plainpasword.encode("utf-8"),
        bcrypt.gensalt()
    )
    return hashed.decode("utf-8")


def verify_password(plainpasword: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plainpasword.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def create_access_token(data:dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {"exp":expire}
    )

    access_token = jwt.encode(
        to_encode, SECRET_KEY,algorithm=ALGORITHM
    )

    return access_token

def verify_access_token(token:str):
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            return None
        return payload
    except:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exceptions = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise credentials_exceptions

    except JWTError:
        raise credentials_exceptions

    user = db.query(auth).filter(
        auth.id == user_id
    ).first()

    if user is None:
        raise credentials_exceptions

    return user
