
import bcrypt

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
