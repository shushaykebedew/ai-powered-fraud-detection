from pydantic import BaseModel

from app.schemas.auth import UserOut


class UserListItem(UserOut):
    pass


class UserUpdate(BaseModel):
    role: str | None = None
    is_active: bool | None = None
