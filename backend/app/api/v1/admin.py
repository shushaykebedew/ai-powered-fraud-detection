from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.base import get_db
from app.models.prediction import Prediction
from app.models.user import User, UserRole
from app.schemas.admin import UserListItem, UserUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserListItem])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}", response_model=UserListItem)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="You can't deactivate your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is not None:
        if payload.role not in (UserRole.admin.value, UserRole.analyst.value):
            raise HTTPException(status_code=400, detail="role must be 'admin' or 'analyst'")
        user.role = UserRole(payload.role)

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user


@router.get("/stats")
def platform_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active.is_(True)).count(),
        "total_predictions": db.query(Prediction).count(),
        "total_fraud_flagged": db.query(Prediction)
        .filter(Prediction.is_fraud_predicted.is_(True))
        .count(),
    }
